import AuthenticationServices
import CryptoKit
import Foundation
import GoogleSignIn
import Supabase
import UIKit

@MainActor
final class AuthService: NSObject {
    private let clientProvider: SupabaseClientProvider
    private let keychainStore: KeychainStore
    private let googleClientID: String

    private var currentNonce: String?
    private let accessKey = "access_token"
    private let refreshKey = "refresh_token"

    init(clientProvider: SupabaseClientProvider, keychainStore: KeychainStore, googleClientID: String) {
        self.clientProvider = clientProvider
        self.keychainStore = keychainStore
        self.googleClientID = googleClientID
    }

    func restoreSession() async -> Bool {
        do {
            guard
                let access = try keychainStore.get(accessKey),
                let refresh = try keychainStore.get(refreshKey)
            else { return false }

            try await clientProvider.client.auth.setSession(accessToken: access, refreshToken: refresh)
            return true
        } catch {
            return false
        }
    }

    func signOut() async throws {
        try await clientProvider.client.auth.signOut()
        try keychainStore.delete(accessKey)
        try keychainStore.delete(refreshKey)
    }

    func currentUserID() -> UUID? {
        clientProvider.client.auth.currentUser?.id
    }

    func signInWithGoogle() async throws {
        guard let topVC = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow })?.rootViewController else {
            throw AuthError.missingPresenter
        }

        let config = GIDConfiguration(clientID: googleClientID)
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: topVC, hint: nil, additionalScopes: [], nonce: nil, configuration: config)

        guard let idToken = result.user.idToken?.tokenString else {
            throw AuthError.missingIdentityToken
        }

        try await clientProvider.client.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(provider: .google, idToken: idToken)
        )

        try persistSession()
        try await upsertProfileIfNeeded(defaultDisplayName: result.user.profile?.name ?? "Church Member")
    }

    func makeAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.fullName, .email]
        let nonce: String
        do {
            nonce = try randomNonceString()
        } catch {
            nonce = UUID().uuidString.replacingOccurrences(of: "-", with: "")
        }
        currentNonce = nonce
        request.nonce = sha256(nonce)
    }

    func handleAppleAuthorization(_ auth: ASAuthorization) async throws {
        guard let credential = auth.credential as? ASAuthorizationAppleIDCredential else {
            throw AuthError.invalidCredential
        }
        guard let tokenData = credential.identityToken,
              let idToken = String(data: tokenData, encoding: .utf8),
              let nonce = currentNonce else {
            throw AuthError.missingIdentityToken
        }

        try await clientProvider.client.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(provider: .apple, idToken: idToken, nonce: nonce)
        )

        try persistSession()

        let fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")
            .trimmingCharacters(in: .whitespaces)
        let displayName = fullName.isEmpty ? "Church Member" : fullName
        try await upsertProfileIfNeeded(defaultDisplayName: displayName)
    }

    func isUsernameAvailable(_ username: String) async throws -> Bool {
        let rows: [UserProfile] = try await clientProvider.client.database
            .from("users")
            .select()
            .ilike("username", pattern: username)
            .limit(1)
            .execute()
            .value
        return rows.isEmpty
    }

    func updateProfile(username: String, displayName: String, bio: String) async throws {
        guard let userID = currentUserID() else { throw AuthError.unauthenticated }
        guard Validators.username(username) else { throw AuthError.invalidUsername }

        struct ProfileUpdate: Encodable {
            let username: String
            let display_name: String
            let bio: String
            let updated_at: String
        }

        let payload = ProfileUpdate(
            username: username.lowercased(),
            display_name: displayName,
            bio: bio,
            updated_at: ISO8601DateFormatter().string(from: .init())
        )

        try await clientProvider.client.database
            .from("users")
            .update(payload)
            .eq("id", value: userID.uuidString)
            .execute()
    }

    private func upsertProfileIfNeeded(defaultDisplayName: String) async throws {
        guard let userID = currentUserID() else { throw AuthError.unauthenticated }

        let existing: [UserProfile] = try await clientProvider.client.database
            .from("users")
            .select()
            .eq("id", value: userID.uuidString)
            .limit(1)
            .execute()
            .value

        guard existing.isEmpty else { return }

        struct NewUser: Encodable {
            let id: UUID
            let username: String
            let display_name: String
            let bio: String
            let verified: Bool
            let church_role: String
        }

        let username = "member_\(userID.uuidString.prefix(8))"
        try await clientProvider.client.database
            .from("users")
            .insert(NewUser(id: userID, username: username, display_name: defaultDisplayName, bio: "", verified: false, church_role: "member"))
            .execute()
    }

    private func persistSession() throws {
        guard let session = clientProvider.client.auth.currentSession else {
            throw AuthError.missingSession
        }
        try keychainStore.set(session.accessToken, for: accessKey)
        try keychainStore.set(session.refreshToken, for: refreshKey)
    }

    private func randomNonceString(length: Int = 32) throws -> String {
        precondition(length > 0)
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var randoms = [UInt8](repeating: 0, count: 16)
            let errorCode = SecRandomCopyBytes(kSecRandomDefault, randoms.count, &randoms)
            if errorCode != errSecSuccess { throw AuthError.nonceGenerationFailed }

            randoms.forEach { random in
                if remainingLength == 0 { return }
                if random < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }

    private func sha256(_ input: String) -> String {
        let data = Data(input.utf8)
        let hashed = SHA256.hash(data: data)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }
}

enum AuthError: Error, LocalizedError {
    case missingPresenter
    case missingIdentityToken
    case invalidCredential
    case missingSession
    case unauthenticated
    case invalidUsername
    case nonceGenerationFailed

    var errorDescription: String? {
        switch self {
        case .missingPresenter: return "Could not locate active view controller."
        case .missingIdentityToken: return "Sign-in token is missing."
        case .invalidCredential: return "Unexpected authorization credential."
        case .missingSession: return "No active session found."
        case .unauthenticated: return "Please sign in first."
        case .invalidUsername: return "Username is invalid."
        case .nonceGenerationFailed: return "Could not generate a secure sign-in challenge."
        }
    }
}
