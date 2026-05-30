import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  AudioSession,
  AndroidAudioTypePresets,
  isTrackReference,
  LiveKitRoom,
  registerGlobals,
  useLocalParticipant,
  useTracks,
  VideoTrack,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import { useUser } from "@clerk/clerk-expo";
import { getLiveKitServerUrl, resolveLiveKitAccessToken } from "@/lib/livekit";

registerGlobals();

const CONTACTS: Record<string, { name: string; initials: string; color: string }> = {
  "1": { name: "Pastor James Osei", initials: "PJ", color: "#3B5BDB" },
  "2": { name: "Elder Ruth Nakamura", initials: "ER", color: "#B8860B" },
  "3": { name: "SDA Prayer Group", initials: "PG", color: "#4A6741" },
  "4": { name: "David Mensah", initials: "DM", color: "#4A5270" },
  "5": { name: "Grace Adetokunbo", initials: "GA", color: "#0E7B5B" },
  "erha-ai": { name: "Erha AI", initials: "AI", color: "#6B7B5A" },
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function CallScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { user, isLoaded: userLoaded } = useUser();

  const targetId = id ?? "4";
  const contact = CONTACTS[targetId] ?? CONTACTS["4"];
  const isVideoCall = type === "video";

  const [connecting, setConnecting] = useState(true);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(!isVideoCall);
  const [cameraOn, setCameraOn] = useState(isVideoCall);
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const roomCode = targetId;
  const liveKitServerUrl = getLiveKitServerUrl();

  useEffect(() => {
    if (!liveKitServerUrl) {
      setTokenError("Calling is not configured yet. Please contact support.");
      setConnecting(false);
      return;
    }

    if (!userLoaded) return;

    let cancelled = false;
    // Stable per-user identity so the other side sees a consistent participant.
    const identity = user?.id ?? `guest-${targetId}-${Date.now()}`;
    const displayName =
      user?.fullName?.trim() ||
      user?.primaryEmailAddress?.emailAddress ||
      user?.username ||
      "SDA Member";

    async function loadToken() {
      try {
        setConnecting(true);
        const resolved = await resolveLiveKitAccessToken({
          roomCode,
          identity,
          displayName,
          metadata: { callType: isVideoCall ? "video" : "audio" },
        });
        if (cancelled) return;
        setToken(resolved.token);
        setTokenError(null);
      } catch (error) {
        if (cancelled) return;
        setTokenError("Unable to connect your call right now. Please try again.");
        setConnecting(false);
      }
    }

    loadToken();

    return () => {
      cancelled = true;
    };
  }, [isVideoCall, liveKitServerUrl, roomCode, targetId, user, userLoaded]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    AudioSession.configureAudio({
      android: {
        preferredOutputList: ["speaker", "headset", "bluetooth", "earpiece"],
        audioTypeOptions: AndroidAudioTypePresets.communication,
      },
      ios: {
        defaultOutput: "speaker",
      },
    }).catch(() => undefined);

    AudioSession.startAudioSession().catch(() => undefined);
    return () => {
      AudioSession.stopAudioSession().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [connected]);

  const subtitle = useMemo(() => {
    if (tokenError) return tokenError;
    if (connecting || !connected) return "Connecting...";
    return isVideoCall ? `Video call live · ${formatDuration(elapsed)}` : `Voice call live · ${formatDuration(elapsed)}`;
  }, [tokenError, connecting, connected, isVideoCall, elapsed]);

  function toggleMic() {
    Haptics.selectionAsync();
    setMicOn((prev) => !prev);
  }

  async function toggleSpeaker() {
    Haptics.selectionAsync();
    const next = !speakerOn;
    setSpeakerOn(next);
    try {
      await AudioSession.selectAudioOutput(next ? "speaker" : "earpiece");
    } catch {
      setSpeakerOn((prev) => !prev);
    }
  }

  function toggleCamera() {
    Haptics.selectionAsync();
    setCameraOn((prev) => !prev);
  }

  function switchCamera() {
    Haptics.selectionAsync();
    setCameraFacing((prev) => (prev === "front" ? "back" : "front"));
  }

  function endCall() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isVideoCall ? "Video Call" : "Voice Call"}</Text>
        <View style={{ width: 36 }} />
      </View>

      {Platform.OS === "web" ? (
        <View style={styles.centerWrap}>
          <View style={[styles.avatar, { backgroundColor: `${contact.color}88` }]}>
            <Text style={styles.initials}>{contact.initials}</Text>
          </View>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.sub}>Web preview does not support native LiveKit calls.</Text>
          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
            <Ionicons name="call" size={20} color="#FFF" style={{ transform: [{ rotate: "135deg" }] }} />
            <Text style={styles.endCallText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : token ? (
        <View style={styles.sessionWrap}>
          <LiveKitRoom
            serverUrl={liveKitServerUrl}
            token={token}
            connect={Boolean(token)}
            audio
            video={isVideoCall && cameraOn}
            onConnected={() => {
              setConnecting(false);
              setConnected(true);
            }}
            onDisconnected={() => {
              setConnected(false);
              setConnecting(false);
            }}
            onError={(error) => {
              setTokenError(error.message);
              setConnecting(false);
            }}
            onMediaDeviceFailure={() => {
              setTokenError("Microphone or camera permission is blocked. Enable access in Settings.");
              setConnecting(false);
            }}
            options={{ adaptiveStream: true, dynacast: true }}
          >
            <NativeCallSession
              isVideoCall={isVideoCall}
              micOn={micOn}
              cameraOn={cameraOn}
              cameraFacing={cameraFacing}
            />
          </LiveKitRoom>

          {connecting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Connecting call...</Text>
            </View>
          )}

          <View style={styles.controlsBar}>
            <TouchableOpacity style={[styles.controlBtn, !micOn && styles.controlBtnOff]} onPress={toggleMic}>
              <Ionicons name={micOn ? "mic" : "mic-off"} size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.controlBtn, !speakerOn && styles.controlBtnOff]} onPress={toggleSpeaker}>
              <Ionicons name={speakerOn ? "volume-high" : "volume-mute"} size={20} color="#FFF" />
            </TouchableOpacity>

            {isVideoCall && (
              <TouchableOpacity style={[styles.controlBtn, !cameraOn && styles.controlBtnOff]} onPress={toggleCamera}>
                <Ionicons name={cameraOn ? "videocam" : "videocam-off"} size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            {isVideoCall && cameraOn && (
              <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
                <Ionicons name="camera-reverse-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
              <Ionicons name="call" size={18} color="#FFF" style={{ transform: [{ rotate: "135deg" }] }} />
              <Text style={styles.endCallText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.centerWrap}>
          <View style={[styles.avatar, { backgroundColor: `${contact.color}88` }]}>
            <Text style={styles.initials}>{contact.initials}</Text>
          </View>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          <Text style={styles.configHint}>{tokenError ?? "Preparing call..."}</Text>
          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
            <Ionicons name="call" size={20} color="#FFF" style={{ transform: [{ rotate: "135deg" }] }} />
            <Text style={styles.endCallText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function NativeCallSession({
  isVideoCall,
  micOn,
  cameraOn,
  cameraFacing,
}: {
  isVideoCall: boolean;
  micOn: boolean;
  cameraOn: boolean;
  cameraFacing: "front" | "back";
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: true });

  useEffect(() => {
    if (!localParticipant) return;
    if (isMicrophoneEnabled !== micOn) {
      localParticipant.setMicrophoneEnabled(micOn).catch(() => undefined);
    }
  }, [isMicrophoneEnabled, localParticipant, micOn]);

  useEffect(() => {
    if (!localParticipant) return;
    const shouldEnable = isVideoCall && cameraOn;
    const facingMode: "user" | "environment" = cameraFacing === "front" ? "user" : "environment";
    const captureOptions = shouldEnable ? { facingMode } : undefined;
    if (isCameraEnabled !== shouldEnable) {
      localParticipant.setCameraEnabled(shouldEnable, captureOptions).catch(() => undefined);
    }
  }, [cameraOn, cameraFacing, isCameraEnabled, isVideoCall, localParticipant]);

  useEffect(() => {
    if (!localParticipant || !isVideoCall || !cameraOn) return;
    const publication = localParticipant.getTrackPublication(Track.Source.Camera);
    const videoTrack = publication?.track as any;
    if (videoTrack && typeof videoTrack.restartTrack === "function") {
      const facingMode: "user" | "environment" = cameraFacing === "front" ? "user" : "environment";
      videoTrack.restartTrack({ facingMode }).catch(() => undefined);
    }
  }, [cameraFacing, cameraOn, isVideoCall, localParticipant]);

  if (!isVideoCall) {
    return <View style={styles.audioOnlyStage} />;
  }

  const cameraTrackRefs = tracks.filter(isTrackReference);
  const remoteTrack = cameraTrackRefs.find((trackRef) => trackRef.participant.identity !== localParticipant.identity);
  const localTrack = cameraTrackRefs.find((trackRef) => trackRef.participant.identity === localParticipant.identity);

  return (
    <View style={styles.videoStage}>
      {remoteTrack ? (
        <VideoTrack trackRef={remoteTrack} style={styles.remoteVideo} objectFit="cover" />
      ) : (
        <View style={styles.waitingRemote}>
          <Text style={styles.waitingRemoteText}>Waiting for the other person to join...</Text>
        </View>
      )}

      {localTrack && (
        <View style={styles.localPreviewWrap}>
          <VideoTrack trackRef={localTrack} style={styles.localPreview} objectFit="cover" mirror />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  sessionWrap: { flex: 1 },
  videoStage: { flex: 1, backgroundColor: "#000" },
  remoteVideo: { flex: 1, backgroundColor: "#000" },
  waitingRemote: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#05070B" },
  waitingRemoteText: { color: "#D1D5DB", fontSize: 14, fontWeight: "500" },
  localPreviewWrap: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 112,
    height: 168,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  localPreview: { flex: 1, backgroundColor: "#111827" },
  audioOnlyStage: { flex: 1, backgroundColor: "#111827" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    gap: 10,
  },
  loadingText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  controlsBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  avatar: { width: 108, height: 108, borderRadius: 54, alignItems: "center", justifyContent: "center" },
  initials: { color: "#FFF", fontSize: 36, fontWeight: "700" },
  name: { color: "#FFF", fontSize: 26, fontWeight: "700", marginTop: 14 },
  sub: { color: "#9CA3AF", fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 8 },
  configHint: {
    marginTop: 12,
    color: "#D1D5DB",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#374151",
  },
  controlBtnOff: {
    backgroundColor: "#3F1D1D",
    borderColor: "#7F1D1D",
  },
  endCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C62828",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  endCallText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
