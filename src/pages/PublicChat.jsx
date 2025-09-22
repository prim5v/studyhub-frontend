import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Send, Smile } from "lucide-react";

const BACKEND_URL = "https://studyhub-8req.onrender.com";

const PublicChat = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.user_id;
  const userName = storedUser?.name || "Anonymous";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    console.log("🔽 Scrolling to bottom...");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial messages from backend
  useEffect(() => {
    console.log("🌐 Fetching initial messages...");
    fetch(`${BACKEND_URL}/api/public-messages`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Initial messages loaded:", data);
        setMessages(data);
      })
      .catch((err) => console.error("❌ Error fetching messages:", err));
  }, []);

  // Setup socket connection + listeners
  useEffect(() => {
    console.log("🔌 Connecting socket...");
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected with id:", socket.id);
      socket.emit("join_public_room");
      console.log("🚪 Joined PUBLIC room");
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Disconnected:", reason);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`🔄 Reconnected after ${attempt} attempts`);
      socket.emit("join_public_room");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("new_public_message", (msg) => {
      console.log("📩 Received message from backend:", msg);

      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      console.log("🛑 Disconnecting socket...");
      socket.disconnect();
    };
  }, []);

  useEffect(scrollToBottom, [messages]);

  // Send a message (no optimistic render)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      console.warn("⚠️ Tried to send empty message.");
      return;
    }

    const msgData = {
      sender_id: userId,
      sender_name: userName,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    console.log("📤 Sending message to backend:", msgData);

    socketRef.current.emit("send_public_message", {
      sender_id: userId,
      message: msgData.message,
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto bg-gray-100 shadow-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender_id === userId
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-black self-start"
            }`}
          >
            <strong>{msg.sender_id === userId ? "You" : msg.sender_name}:</strong>{" "}
            {msg.message}
            <div className="text-xs text-right">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Emoji Picker */}
      <div className="p-4 border-t bg-white flex items-center space-x-2 relative">
        <button
          type="button"
          onClick={() => {
            console.log("😀 Emoji picker toggled:", !showEmojiPicker);
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            console.log("⌨️ Typing message:", e.target.value);
            setNewMessage(e.target.value);
          }}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          <Send className="h-5 w-5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emoji) => {
                console.log("🎉 Emoji selected:", emoji.native);
                setNewMessage((prev) => prev + emoji.native);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicChat;
