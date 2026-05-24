class WebSocketShim {
  constructor(url, protocols) {
    if (typeof global.WebSocket !== "function") {
      this.url = url;
      this.readyState = WebSocketShim.CLOSED;
      setTimeout(() => {
        if (typeof this.onerror === "function") {
          this.onerror(new Error("Global WebSocket is not available in this runtime"));
        }
        if (typeof this.onclose === "function") {
          this.onclose({ code: 1006, reason: "WebSocket unavailable" });
        }
      }, 0);
      return;
    }

    return new global.WebSocket(url, protocols);
  }

  send() {}

  close() {
    this.readyState = WebSocketShim.CLOSED;
  }
}

WebSocketShim.CONNECTING = 0;
WebSocketShim.OPEN = 1;
WebSocketShim.CLOSING = 2;
WebSocketShim.CLOSED = 3;

module.exports = WebSocketShim;
