import Foundation

final class RealtimeManager {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func observePosts(onChange: @escaping @Sendable () -> Void) async {
        let channel = clientProvider.client.realtime.channel("posts-feed")
        _ = channel.onPostgresChange(
            AnyAction.self,
            schema: "public",
            table: "posts"
        ) { _ in
            onChange()
        }
        await channel.subscribe()
    }

    func observeMessages(onChange: @escaping @Sendable () -> Void) async {
        let channel = clientProvider.client.realtime.channel("messages-feed")
        _ = channel.onPostgresChange(
            AnyAction.self,
            schema: "public",
            table: "messages"
        ) { _ in
            onChange()
        }
        await channel.subscribe()
    }
}
