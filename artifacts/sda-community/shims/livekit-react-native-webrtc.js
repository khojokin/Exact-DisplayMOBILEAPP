function RTCVideoView() { return null; }
function RTCView() { return null; }

function MediaStreamTrack() {}
MediaStreamTrack.prototype.stop = function() {};

function MediaStream() {
  this.id = Math.random().toString(36).slice(2);
  this._tracks = [];
}
MediaStream.prototype.getTracks = function() { return []; };
MediaStream.prototype.getAudioTracks = function() { return []; };
MediaStream.prototype.getVideoTracks = function() { return []; };
MediaStream.prototype.addTrack = function() {};
MediaStream.prototype.removeTrack = function() {};
MediaStream.prototype.clone = function() { return new MediaStream(); };

function RTCPeerConnection() {}
RTCPeerConnection.prototype.close = function() {};
RTCPeerConnection.prototype.createOffer = function() { return Promise.resolve({}); };
RTCPeerConnection.prototype.createAnswer = function() { return Promise.resolve({}); };
RTCPeerConnection.prototype.setLocalDescription = function() { return Promise.resolve(); };
RTCPeerConnection.prototype.setRemoteDescription = function() { return Promise.resolve(); };
RTCPeerConnection.prototype.addIceCandidate = function() { return Promise.resolve(); };

function RTCSessionDescription(init) { this.type = init && init.type; this.sdp = init && init.sdp; }
function RTCIceCandidate(init) { Object.assign(this, init); }

var NativeEventTarget = (typeof global !== 'undefined' && global.EventTarget) || (typeof EventTarget !== 'undefined' ? EventTarget : null);
var BaseEventTarget = NativeEventTarget || (function() {
  function EventTargetShim() { this._listeners = {}; }
  EventTargetShim.prototype.addEventListener = function(type, listener) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(listener);
  };
  EventTargetShim.prototype.removeEventListener = function(type, listener) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(function(l) { return l !== listener; });
  };
  EventTargetShim.prototype.dispatchEvent = function(event) {
    var listeners = this._listeners[event.type] || [];
    listeners.forEach(function(l) { l(event); });
    return true;
  };
  return EventTargetShim;
}());

function EventShim(type, init) {
  this.type = type;
  this.bubbles = (init && init.bubbles) || false;
  this.cancelable = (init && init.cancelable) || false;
}

function getEventAttributeValue(target, type) {
  return (target && target['_on' + type]) || null;
}
function setEventAttributeValue(target, type, listener) {
  if (target) target['_on' + type] = listener;
}

module.exports = {
  RTCVideoView: RTCVideoView,
  RTCView: RTCView,
  MediaStream: MediaStream,
  MediaStreamTrack: MediaStreamTrack,
  RTCPeerConnection: RTCPeerConnection,
  RTCSessionDescription: RTCSessionDescription,
  RTCIceCandidate: RTCIceCandidate,
  EventTarget: BaseEventTarget,
  Event: EventShim,
  getEventAttributeValue: getEventAttributeValue,
  setEventAttributeValue: setEventAttributeValue,
  mediaDevices: {
    getUserMedia: function() { return Promise.reject(new Error('WebRTC not available on web')); },
    enumerateDevices: function() { return Promise.resolve([]); },
  },
};
