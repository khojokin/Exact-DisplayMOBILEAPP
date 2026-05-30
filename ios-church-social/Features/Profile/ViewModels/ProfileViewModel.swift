import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: UserProfile?
    @Published var myPosts: [PostItem] = []
    @Published var followers = 0
    @Published var following = 0
    @Published var errorMessage: String?

    private let authService: AuthService
    private let clientProvider: SupabaseClientProvider
    private let uploadManager: MediaUploadManager

    init(authService: AuthService, clientProvider: SupabaseClientProvider, uploadManager: MediaUploadManager) {
        self.authService = authService
        self.clientProvider = clientProvider
        self.uploadManager = uploadManager
    }

    func load() async {
        do {
            guard let userID = authService.currentUserID() else { return }

            let rows: [UserProfile] = try await clientProvider
                .client
                .client
                .database
                .from("users")
                .select()
                .eq("id", value: userID.uuidString)
                .limit(1)
                .execute()
                .value
            profile = rows.first
            myPosts = try await clientProvider
                .client
                .clientProvider
                .client
                .database
                .from("posts")
                .select()
                .eq("user_id", value: userID.uuidString)
                .order("created_at", ascending: false)
                .execute()
            let followerRows: [[String: UUID]] = try await clientProvider
            let followerRows: [[String: UUID]] = try await feedService
                .clientProvider
                .client
                .database
                .from("follows")
                .select("id")
                .eq("following_id", value: userID.uuidString)
                .execute()
                .value
            let followingRows: [[String: UUID]] = try await clientProvider
            let followingRows: [[String: UUID]] = try await feedService
                .clientProvider
                .client
                .database
                .from("follows")
                .select("id")
                .eq("follower_id", value: userID.uuidString)
                .execute()
                .value
            following = followingRows.count
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateProfile(username: String, displayName: String, bio: String) async {
        do {
            try await authService.updateProfile(username: username, displayName: displayName, bio: bio)
            await load()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
