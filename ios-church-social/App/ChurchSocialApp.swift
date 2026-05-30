import SwiftUI

@main
struct ChurchSocialApp: App {
    @StateObject private var containerLoader = ContainerLoader()

    var body: some Scene {
        WindowGroup {
            Group {
                if let container = containerLoader.container {
                    RootView()
                        .environmentObject(container)
                } else {
                    ProgressView("Loading...")
                }
            }
            .task {
                await containerLoader.loadContainer()
            }
        }
    }
}

@MainActor
final class ContainerLoader: ObservableObject {
    @Published var container: DependencyContainer?

    func loadContainer() async {
        guard container == nil else { return }
        do {
            container = try DependencyContainer()
        } catch {
            assertionFailure("App environment is not configured: \(error)")
        }
    }
}

struct RootView: View {
    @EnvironmentObject private var container: DependencyContainer
    @StateObject private var authViewModel: AuthViewModel

    init() {
        _authViewModel = StateObject(wrappedValue: AuthViewModel())
    }

    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView(authViewModel: authViewModel)
            } else {
                SignInView(viewModel: authViewModel)
            }
        }
        .task {
            authViewModel.bind(service: container.authService)
            await authViewModel.restoreSession()
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject private var container: DependencyContainer
    @ObservedObject var authViewModel: AuthViewModel

    var body: some View {
        TabView {
            FeedView(viewModel: FeedViewModel(feedService: container.feedService, realtimeManager: container.realtimeManager, uploadManager: container.uploadManager))
                .tabItem { Label("Feed", systemImage: "house") }

            MessagesView(viewModel: MessagesViewModel(service: container.messagingService, realtimeManager: container.realtimeManager))
                .tabItem { Label("Messages", systemImage: "bubble.left.and.bubble.right") }

            ChurchHubView()
                .tabItem { Label("Church", systemImage: "building.columns") }

            ProfileView(viewModel: ProfileViewModel(authService: container.authService, clientProvider: container.supabase, uploadManager: container.uploadManager), authViewModel: authViewModel)
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
    }
}
