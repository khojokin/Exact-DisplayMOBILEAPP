import SwiftUI

struct MessagesView: View {
    @StateObject var viewModel: MessagesViewModel

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                if viewModel.peerID == nil {
                    Text("Open a conversation from your DM list")
                        .foregroundStyle(.secondary)
                } else {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 8) {
                            ForEach(viewModel.items) { message in
                                Text(message.body ?? "[media]")
                                    .padding(10)
                                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                            }
                        }
                        .padding(.horizontal, 12)
                    }

                    HStack {
                        TextField("Message...", text: $viewModel.draft)
                            .textFieldStyle(.roundedBorder)
                        Button("Send") {
                            Task { await viewModel.sendDraft() }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding(.horizontal, 12)
                }
            }
            .navigationTitle("Messages")
            .task {
                // Replace with selected conversation user from list.
                await viewModel.openConversation(with: UUID(uuidString: "00000000-0000-0000-0000-000000000001") ?? UUID())
            }
        }
    }
}
