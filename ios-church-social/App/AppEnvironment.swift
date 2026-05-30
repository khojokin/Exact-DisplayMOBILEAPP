import Foundation

struct AppEnvironment {
    let supabaseURL: URL
    let supabaseAnonKey: String
    let googleClientID: String

    static func load() throws -> AppEnvironment {
        guard
            let path = Bundle.main.path(forResource: "AppEnvironment", ofType: "plist"),
            let values = NSDictionary(contentsOfFile: path) as? [String: Any]
        else {
            throw EnvironmentError.missingFile
        }

        guard
            let urlString = values["SUPABASE_URL"] as? String,
            let url = URL(string: urlString),
            let key = values["SUPABASE_ANON_KEY"] as? String,
            let googleID = values["GOOGLE_CLIENT_ID"] as? String,
            !key.isEmpty,
            !googleID.isEmpty
        else {
            throw EnvironmentError.invalidValues
        }

        return AppEnvironment(supabaseURL: url, supabaseAnonKey: key, googleClientID: googleID)
    }
}

enum EnvironmentError: Error {
    case missingFile
    case invalidValues
}
