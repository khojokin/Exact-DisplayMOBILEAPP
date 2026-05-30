import SwiftUI

struct ProfileView: View {
    @StateObject var viewModel: ProfileViewModel
    @ObservedObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    Circle()
                        .fill(.white.opacity(0.15))
                        .frame(width: 96, height: 96)
                        .overlay {
                            Text(viewModel.profile?.displayName.prefix(1) ?? "?")
                                .font(.largeTitle.bold())
                        }

                    Text(viewModel.profile?.displayName ?? "")
                        .font(.title2.bold())

                    Text("@\(viewModel.profile?.username ?? "")")
                        .foregroundStyle(.secondary)

                    HStack(spacing: 24) {
                        StatView(label: "Posts", value: viewModel.myPosts.count)
                        StatView(label: "Followers", value: viewModel.followers)
                        StatView(label: "Following", value: viewModel.following)
                    }

                    Text(viewModel.profile?.bio ?? "")
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 20)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
                        ForEach(viewModel.myPosts) { _ in
                            Rectangle()
                                .fill(.white.opacity(0.08))
                                .frame(height: 112)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                    .padding(.horizontal, 12)

                    Button(role: .destructive) {
                        Task { await authViewModel.signOut() }
                    } label: {
                        Text("Logout")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.bordered)
                    .padding(.horizontal, 18)
                }
                .padding(.top, 16)
            }
            .navigationTitle("Profile")
            .task {
                await viewModel.load()
            }
        }
    }
}

private struct StatView: View {
    let label: String
    let value: Int

    var body: some View {
        VStack(spacing: 2) {
            Text("\(value)").font(.headline)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
    }
}
