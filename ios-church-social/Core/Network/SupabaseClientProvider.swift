import Foundation
import Supabase

final class SupabaseClientProvider {
    let client: SupabaseClient

    init(environment: AppEnvironment) {
        client = SupabaseClient(
            supabaseURL: environment.supabaseURL,
            supabaseKey: environment.supabaseAnonKey
        )
    }
}
