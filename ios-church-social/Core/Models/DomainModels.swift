import Foundation

struct UserProfile: Codable, Identifiable {
    let id: UUID
    let username: String
    let displayName: String
    let bio: String
    let avatarURL: String?
    let verified: Bool
    let churchRole: String

    enum CodingKeys: String, CodingKey {
        case id, username, bio, verified
        case displayName = "display_name"
        case avatarURL = "avatar_url"
        case churchRole = "church_role"
    }
}

struct PostItem: Codable, Identifiable {
    let id: UUID
    let userID: UUID
    let caption: String
    let mediaType: String
    let mediaPath: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, caption
        case userID = "user_id"
        case mediaType = "media_type"
        case mediaPath = "media_path"
        case createdAt = "created_at"
    }
}

struct MessageItem: Codable, Identifiable {
    let id: UUID
    let senderID: UUID
    let receiverID: UUID
    let body: String?
    let mediaPath: String?
    let readAt: Date?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, body
        case senderID = "sender_id"
        case receiverID = "receiver_id"
        case mediaPath = "media_path"
        case readAt = "read_at"
        case createdAt = "created_at"
    }
}

struct ChurchEvent: Codable, Identifiable {
    let id: UUID
    let title: String
    let description: String
    let startsAt: Date
    let endsAt: Date?
    let location: String?
    let livestreamURL: String?

    enum CodingKeys: String, CodingKey {
        case id, title, description, location
        case startsAt = "starts_at"
        case endsAt = "ends_at"
        case livestreamURL = "livestream_url"
    }
}

struct PrayerRequest: Codable, Identifiable {
    let id: UUID
    let userID: UUID
    let title: String
    let body: String
    let isAnonymous: Bool
    let isAnswered: Bool

    enum CodingKeys: String, CodingKey {
        case id, title, body
        case userID = "user_id"
        case isAnonymous = "is_anonymous"
        case isAnswered = "is_answered"
    }
}
