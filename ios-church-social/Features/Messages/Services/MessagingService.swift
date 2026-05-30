import Foundation

final class MessagingService {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func fetchConversation(with userID: UUID, limit: Int = 50) async throws -> [MessageItem] {
        guard let me = clientProvider.client.auth.currentUser?.id else { return [] }

        return try await clientProvider.client.database
            .from("messages")
            .select()
            .or("and(sender_id.eq.\(me.uuidString),receiver_id.eq.\(userID.uuidString)),and(sender_id.eq.\(userID.uuidString),receiver_id.eq.\(me.uuidString))")
            .order("created_at", ascending: true)
            .limit(limit)
            .execute()
            .value
    }

    func sendMessage(to userID: UUID, body: String) async throws {
        guard let me = clientProvider.client.auth.currentUser?.id else { return }

        struct NewMessage: Encodable {
            let sender_id: UUID
            let receiver_id: UUID
            let body: String
        }

        try await clientProvider.client.database
            .from("messages")
            .insert(NewMessage(sender_id: me, receiver_id: userID, body: body))
            .execute()
    }
}
