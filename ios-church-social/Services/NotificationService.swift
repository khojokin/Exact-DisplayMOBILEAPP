import Foundation

final class AppNotificationService {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func fetchNotifications(limit: Int = 50) async throws -> [[String: String]] {
        guard let userID = clientProvider.client.auth.currentUser?.id else { return [] }

        return try await clientProvider.client.database
            .from("notifications")
            .select("id, message, notification_type")
            .eq("user_id", value: userID.uuidString)
            .order("created_at", ascending: false)
            .limit(limit)
            .execute()
            .value
    }

    func markRead(notificationID: UUID) async throws {
        struct Patch: Encodable { let is_read: Bool }

        try await clientProvider.client.database
            .from("notifications")
            .update(Patch(is_read: true))
            .eq("id", value: notificationID.uuidString)
            .execute()
    }
}
