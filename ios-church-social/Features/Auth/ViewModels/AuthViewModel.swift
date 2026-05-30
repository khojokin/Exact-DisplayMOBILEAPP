import AuthenticationServices
import Foundation

@MainActor
final class AuthViewModel: NSObject, ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private var service: AuthService?

    func bind(service: AuthService) {
        self.service = service
    }

    func restoreSession() async {
        guard let service else { return }
        isAuthenticated = await service.restoreSession()
    }

    func signInWithGoogle() async {
        guard let service else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            try await service.signInWithGoogle()
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() async {
        guard let service else { return }
        do {
            try await service.signOut()
            isAuthenticated = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func prepareAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        service?.makeAppleRequest(request)
    }

    func handleAppleResult(_ result: Result<ASAuthorization, Error>) async {
        guard let service else { return }
        isLoading = true
        defer { isLoading = false }

        switch result {
        case .success(let auth):
            do {
                try await service.handleAppleAuthorization(auth)
                isAuthenticated = true
            } catch {
                errorMessage = error.localizedDescription
            }
        case .failure(let err):
            errorMessage = err.localizedDescription
        }
    }
}
