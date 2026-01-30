Signaling Server (minimal)

This is a minimal WebSocket-based signaling server to help WebRTC peers automatically exchange SDP/ICE messages.

Quick start:
1. cd to the app folder
2. npm install ws
3. node signaling-server.js
4. Open your clients, set the "Signaling server URL" to ws://<server>:3000 and "チーム名" to the same room, then click "シグナリング接続" to enable automatic connection.

Notes:
- This server only relays messages between peers in the same room.
- It's intentionally minimal (no authentication). For production, add authentication and rate limiting.
