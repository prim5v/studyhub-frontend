// src/socket.js
import { io } from "socket.io-client";

// Connect to Flask-SocketIO backend
const socket = io("https://studyhub-8req.onrender.com", {
  transports: ["websocket", "polling"], // allow fallback
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  withCredentials: true, // allow CORS cookies if needed
});

// 🔹 Debug logs
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
// http://192.168.4.107:5000