import AuthenticationServices
import SwiftUI

struct SignInView: View {
    @ObservedObject var viewModel: AuthViewModel

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.black, Color.blue.opacity(0.3), Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                Text("SDA Community")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("Faith. Fellowship. Community.")
                    .foregroundStyle(.white.opacity(0.8))

                VStack(spacing: 14) {
                    SignInWithAppleButton(
                        .signIn,
                        onRequest: viewModel.prepareAppleRequest,
                        onCompletion: { result in
                            Task { await viewModel.handleAppleResult(result) }
                        }
                    )
                    .frame(height: 48)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button {
                        Task { await viewModel.signInWithGoogle() }
                    } label: {
                        Text("Continue with Google")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(.black)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal, 24)

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }

                Spacer()
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.2)
            }
        }
    }
}
