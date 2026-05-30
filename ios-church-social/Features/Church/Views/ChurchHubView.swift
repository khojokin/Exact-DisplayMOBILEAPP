import SwiftUI

struct ChurchHubView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("Church Events") {
                    Label("Sabbath Service", systemImage: "calendar")
                    Label("Midweek Prayer", systemImage: "clock")
                }

                Section("Livestream") {
                    Label("Join Live Worship", systemImage: "dot.radiowaves.left.and.right")
                }

                Section("Prayer Wall") {
                    Label("Submit Prayer Request", systemImage: "hands.sparkles")
                    Label("Pray for Community", systemImage: "heart")
                }

                Section("Sermons") {
                    Label("Latest Sermon Uploads", systemImage: "play.rectangle")
                }
            }
            .navigationTitle("Church Hub")
        }
    }
}
