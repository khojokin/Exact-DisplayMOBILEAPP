const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
const wsShim = path.resolve(__dirname, "./shims/ws.js");
const emptyShim = path.resolve(__dirname, "./shims/empty.js");
const webrtcShim = path.resolve(__dirname, "./shims/livekit-react-native-webrtc.js");
const livekitNativeShim = path.resolve(__dirname, "./shims/livekit-react-native.js");
const iapShim = path.resolve(__dirname, "./shims/expo-in-app-purchases.js");
const clerkWebShim = path.resolve(__dirname, "./shims/clerk-expo-web.js");
const keyboardControllerShim = path.resolve(__dirname, "./shims/react-native-keyboard-controller.js");
const secureStoreShim = path.resolve(__dirname, "./shims/expo-secure-store.js");
const previousResolveRequest = config.resolver?.resolveRequest;

config.resolver = {
        ...(config.resolver ?? {}),
        extraNodeModules: {
                ...(config.resolver?.extraNodeModules ?? {}),
                ws: wsShim,
                stream: emptyShim,
        },
        resolveRequest: (context, moduleName, platform) => {
                if (moduleName === "ws") {
                        return { filePath: wsShim, type: "sourceFile" };
                }
                if (moduleName === "stream") {
                        return { filePath: emptyShim, type: "sourceFile" };
                }

                if (platform === "web") {
                        // Bypass Clerk auth on web — mock a signed-in preview user
                        if (
                                moduleName === "@clerk/clerk-expo" ||
                                moduleName.startsWith("@clerk/clerk-expo/")
                        ) {
                                return { filePath: clerkWebShim, type: "sourceFile" };
                        }

                        // Stub out native WebRTC module on web
                        if (
                                moduleName === "@livekit/react-native-webrtc" ||
                                moduleName.startsWith("@livekit/react-native-webrtc/")
                        ) {
                                return { filePath: webrtcShim, type: "sourceFile" };
                        }

                        // Stub out @livekit/react-native on web
                        if (
                                moduleName === "@livekit/react-native" ||
                                moduleName.startsWith("@livekit/react-native/")
                        ) {
                                return { filePath: livekitNativeShim, type: "sourceFile" };
                        }

                        // Stub out expo-in-app-purchases on web (native module only)
                        if (
                                moduleName === "expo-in-app-purchases" ||
                                moduleName.startsWith("expo-in-app-purchases/")
                        ) {
                                return { filePath: iapShim, type: "sourceFile" };
                        }

                        // Stub out react-native-keyboard-controller on web
                        if (
                                moduleName === "react-native-keyboard-controller" ||
                                moduleName.startsWith("react-native-keyboard-controller/")
                        ) {
                                return { filePath: keyboardControllerShim, type: "sourceFile" };
                        }

                        // Replace expo-secure-store with localStorage-based shim on web
                        if (
                                moduleName === "expo-secure-store" ||
                                moduleName.startsWith("expo-secure-store/")
                        ) {
                                return { filePath: secureStoreShim, type: "sourceFile" };
                        }
                }

                if (previousResolveRequest) {
                        return previousResolveRequest(context, moduleName, platform);
                }

                return context.resolveRequest(context, moduleName, platform);
        },
};

// Allow all hosts so Replit's proxy can reach Metro (required for preview pane)
config.server = {
  ...(config.server ?? {}),
  dangerouslyDisableHostCheck: true,
};

module.exports = config;
