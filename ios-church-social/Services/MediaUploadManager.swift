import Foundation

final class MediaUploadManager {
    private let clientProvider: SupabaseClientProvider

    init(clientProvider: SupabaseClientProvider) {
        self.clientProvider = clientProvider
    }

    func uploadPostMedia(data: Data, ext: String) async throws -> String {
        guard let userID = clientProvider.client.auth.currentUser?.id else {
            throw UploadError.unauthenticated
        }

        let path = "\(userID.uuidString)/posts/\(UUID().uuidString).\(ext)"
        try await clientProvider.client.storage
            .from("post-media")
            .upload(path: path, file: data, options: FileOptions(contentType: contentType(for: ext), upsert: false))
        return path
    }

    func uploadAvatar(data: Data, ext: String) async throws -> String {
        guard let userID = clientProvider.client.auth.currentUser?.id else {
            throw UploadError.unauthenticated
        }

        let path = "\(userID.uuidString)/avatar.\(ext)"
        try await clientProvider.client.storage
            .from("avatars")
            .upload(path: path, file: data, options: FileOptions(contentType: contentType(for: ext), upsert: true))
        return path
    }

    private func contentType(for ext: String) -> String {
        switch ext.lowercased() {
        case "jpg", "jpeg": return "image/jpeg"
        case "png": return "image/png"
        case "heic": return "image/heic"
        case "mp4": return "video/mp4"
        case "mov": return "video/quicktime"
        default: return "application/octet-stream"
        }
    }
}

enum UploadError: Error {
    case unauthenticated
}
