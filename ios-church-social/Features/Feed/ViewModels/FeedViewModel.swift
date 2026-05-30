import Foundation

@MainActor
final class FeedViewModel: ObservableObject {
    @Published var posts: [PostItem] = []
    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var errorMessage: String?

    private let feedService: FeedService
    private let realtimeManager: RealtimeManager
    private let uploadManager: MediaUploadManager

    private var offset = 0
    private let pageSize = 20

    init(feedService: FeedService, realtimeManager: RealtimeManager, uploadManager: MediaUploadManager) {
        self.feedService = feedService
        self.realtimeManager = realtimeManager
        self.uploadManager = uploadManager
    }

    func onAppear() async {
        if posts.isEmpty {
            await refresh()
        }

        await realtimeManager.observePosts { [weak self] in
            Task { await self?.refresh() }
        }
    }

    func refresh() async {
        isRefreshing = true
        offset = 0
        defer { isRefreshing = false }

        do {
            posts = try await feedService.fetchFeed(limit: pageSize, offset: 0)
            offset = posts.count
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadMoreIfNeeded(current post: PostItem) async {
        guard !isLoading, post.id == posts.last?.id else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            let next = try await feedService.fetchFeed(limit: pageSize, offset: offset)
            posts.append(contentsOf: next)
            offset += next.count
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createPost(caption: String, mediaData: Data, mediaType: String, ext: String) async {
        do {
            let remotePath = try await uploadManager.uploadPostMedia(data: mediaData, ext: ext)
            try await feedService.createPost(caption: caption, mediaType: mediaType, mediaPath: remotePath)
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
