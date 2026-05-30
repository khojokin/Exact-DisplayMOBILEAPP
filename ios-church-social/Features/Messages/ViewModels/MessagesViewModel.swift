import Foundation

@MainActor
final class MessagesViewModel: ObservableObject {
    @Published var items: [MessageItem] = []
    @Published var draft = ""
    @Published var peerID: UUID? = nil
    @Published var isTyping = false

    private let service: MessagingService
    private let realtimeManager: RealtimeManager

    init(service: MessagingService, realtimeManager: RealtimeManager) {
        self.service = service
        self.realtimeManager = realtimeManager
    }

    func openConversation(with userID: UUID) async {
        peerID = userID
        await reload()

        await realtimeManager.observeMessages { [weak self] in
            Task { await self?.reload() }
        }
    }

    func reload() async {
        guard let peerID else { return }
        do {
            items = try await service.fetchConversation(with: peerID)
        } catch {
            print("Message reload failed: \(error)")
        }
    }

    func sendDraft() async {
        guard let peerID, Validators.nonEmpty(draft) else { return }
        let message = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        draft = ""

        do {
            try await service.sendMessage(to: peerID, body: message)
            await reload()
        } catch {
            print("Send message failed: \(error)")
        }
    }
}
