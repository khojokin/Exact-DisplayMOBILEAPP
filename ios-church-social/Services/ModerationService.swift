import Foundation

final class ModerationService {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func reportPost(postID: UUID, reason: String) async throws {
        guard let userID = clientProvider.client.auth.currentUser?.id else { return }

        struct NewReport: Encodable {
            let reporter_id: UUID
            let target_post_id: UUID
            let reason: String
        }

        try await clientProvider.client.database
            .from("reports")
            .insert(NewReport(reporter_id: userID, target_post_id: postID, reason: reason))
            .execute()
    }

    func createAnnouncement(title: String, body: String) async throws {
        guard let userID = clientProvider.client.auth.currentUser?.id else { return }

        struct Announcement: Encodable {
            let title: String
            let body: String
            let created_by: UUID
        }

        try await clientProvider.client.database
            .from("announcements")
            .insert(Announcement(title: title, body: body, created_by: userID))
            .execute()
    }
}
