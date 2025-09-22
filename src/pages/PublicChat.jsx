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
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial messages
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/public-messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);
  }, []);

  // Setup socket
  useEffect(() => {
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
    });

    // Incoming messages
    socket.on("new_public_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender_id !== userId) {
        // New message from other user
        const audio = new Audio("/pop.wav");
        audio.play().catch(() => {});
        setUnreadCount((prev) => prev + 1);
      } else {
        // Message sent by you
        const audio = new Audio("/sent.wav");
        audio.play().catch(() => {});
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(scrollToBottom, [messages]);

  // Reset unread count when viewing messages
  useEffect(() => {
    setUnreadCount(0);
  }, [messages]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      sender_id: userId,
      sender_name: userName,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

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
      <form
        className="p-4 border-t bg-white flex items-center space-x-2 relative"
        onSubmit={handleSendMessage}
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          <Send className="h-5 w-5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji.native)}
            />
          </div>
        )}
      </form>

      {/* 🔔 Unread badge */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full animate-bounce shadow-lg">
          {unreadCount} new message{unreadCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default PublicChat;
