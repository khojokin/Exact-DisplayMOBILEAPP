import Foundation

@MainActor
final class DependencyContainer: ObservableObject {
    let environment: AppEnvironment
    let keychainStore = KeychainStore(service: "com.churchsocial.auth")

    let supabase: SupabaseClientProvider
    let authService: AuthService
    let feedService: FeedService
    let messagingService: MessagingService
    let uploadManager: MediaUploadManager
    let realtimeManager: RealtimeManager
    let notificationService: AppNotificationService
    let moderationService: ModerationService

    init() throws {
        self.environment = try AppEnvironment.load()
        self.supabase = SupabaseClientProvider(environment: environment)
        self.authService = AuthService(clientProvider: supabase, keychainStore: keychainStore, googleClientID: environment.googleClientID)
        self.feedService = FeedService(clientProvider: supabase)
        self.messagingService = MessagingService(clientProvider: supabase)
        self.uploadManager = MediaUploadManager(clientProvider: supabase)
        self.realtimeManager = RealtimeManager(clientProvider: supabase)
        self.notificationService = AppNotificationService(clientProvider: supabase)
        self.moderationService = ModerationService(clientProvider: supabase)
    }
}
