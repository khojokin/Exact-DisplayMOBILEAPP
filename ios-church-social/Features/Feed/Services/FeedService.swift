import Foundation
import Supabase

final class FeedService {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func fetchFeed(limit: Int = 25, offset: Int = 0) async throws -> [PostItem] {
        try await clientProvider.client.database
            .from("posts")
            .select()
            .order("created_at", ascending: false)
            .range(from: offset, to: offset + max(0, limit - 1))
            .execute()
            .value
    }

    func createPost(caption: String, mediaType: String, mediaPath: String) async throws {
        guard let userID = clientProvider.client.auth.currentUser?.id else {
            throw FeedError.unauthenticated
        }

        struct NewPost: Encodable {
            let user_id: UUID
            let caption: String
            let media_type: String
            let media_path: String
        }

        try await clientProvider.client.database
            .from("posts")
            .insert(NewPost(user_id: userID, caption: caption, media_type: mediaType, media_path: mediaPath))
            .execute()
    }

    func toggleLike(postID: UUID, isLiked: Bool) async throws {
        guard let userID = clientProvider.client.auth.currentUser?.id else { throw FeedError.unauthenticated }

        if isLiked {
            try await clientProvider.client.database
                .from("likes")
                .delete()
                .eq("post_id", value: postID.uuidString)
                .eq("user_id", value: userID.uuidString)
                .execute()
        } else {
            struct NewLike: Encodable {
                let post_id: UUID
                let user_id: UUID
            }
            try await clientProvider.client.database
                .from("likes")
                .insert(NewLike(post_id: postID, user_id: userID))
                .execute()
        }
    }
}

enum FeedError: Error {
    case unauthenticated
}
