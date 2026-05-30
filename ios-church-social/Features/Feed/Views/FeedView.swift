import SwiftUI

struct FeedView: View {
    @StateObject var viewModel: FeedViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(viewModel.posts) { post in
                        GlassPostCard(post: post)
                            .onAppear {
                                Task { await viewModel.loadMoreIfNeeded(current: post) }
                            }
                    }

                    if viewModel.isLoading {
                        ProgressView().padding(.vertical, 12)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.top, 10)
            }
            .refreshable {
                await viewModel.refresh()
            }
            .navigationTitle("Community")
            .task {
                await viewModel.onAppear()
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") { viewModel.errorMessage = nil }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
    }
}

struct GlassPostCard: View {
    let post: PostItem

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            RoundedRectangle(cornerRadius: 18)
                .fill(.white.opacity(0.08))
                .frame(height: 320)
                .overlay {
                    VStack {
                        Text(post.mediaType.uppercased())
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.75))
                        Text(post.mediaPath)
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.5))
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                    }
                }

            if !post.caption.isEmpty {
                Text(post.caption)
                    .font(.body)
                    .foregroundStyle(.primary)
            }
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.2), radius: 20, x: 0, y: 12)
    }
}
