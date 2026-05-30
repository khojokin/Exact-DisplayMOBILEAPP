import SwiftUI

struct AdminPanelView: View {
    var body: some View {
        List {
            Section("Moderation") {
                Label("Review Reports", systemImage: "exclamationmark.bubble")
                Label("Remove Content", systemImage: "trash")
                Label("User Role Management", systemImage: "person.3.sequence")
            }

            Section("Announcements") {
                Label("Post Announcement", systemImage: "megaphone")
            }
        }
        .navigationTitle("Admin")
    }
}
