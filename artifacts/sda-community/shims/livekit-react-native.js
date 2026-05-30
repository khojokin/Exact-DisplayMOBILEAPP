const React = require("react");

function LiveKitRoom({ children }) { return children || null; }
function VideoTrack() { return null; }
function AudioTrack() { return null; }
function useLocalParticipant() { return { localParticipant: null, isMicrophoneEnabled: false, isCameraEnabled: false }; }
function useTracks() { return []; }
function useRoomContext() { return null; }
function useParticipants() { return []; }
function useRemoteParticipants() { return []; }
function useLocalParticipantPermissions() { return null; }
function AudioSession() {}
AudioSession.startAudioSession = () => Promise.resolve();
AudioSession.stopAudioSession = () => Promise.resolve();

const AndroidAudioTypePresets = {};

function registerGlobals() {}
function isTrackReference() { return false; }

module.exports = {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useLocalParticipant,
  useTracks,
  useRoomContext,
  useParticipants,
  useRemoteParticipants,
  useLocalParticipantPermissions,
  AudioSession,
  AndroidAudioTypePresets,
  registerGlobals,
  isTrackReference,
};
