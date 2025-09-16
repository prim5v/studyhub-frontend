import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Users, Paperclip, Send } from "lucide-react";

const socket = io("https://studyhub-8req.onrender.com", {
  transports: ["websocket", "polling"],
});
const API_BASE_URL = "https://studyhub-8req.onrender.com";

export const StudyGroup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const group = location.state?.group;

  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loadingMember, setLoadingMember] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;

  console.log("StudyGroup mounted", { group, user });

  // 🔹 Check membership via API
  useEffect(() => {
    const checkMembership = async () => {
      if (!group || !userId) return;
      console.log("Checking membership for user:", userId, "in group:", group.id);
      try {
        const res = await fetch(`${API_BASE_URL}/api/is-member`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group_id: group.id, user_id: userId }),
        });
        const data = await res.json();
        console.log("Membership API response:", data);
        setIsMember(data.is_member);
      } catch (err) {
        console.error("Error checking membership:", err);
      } finally {
        setLoadingMember(false);
      }
    };
    checkMembership();
  }, [group, userId]);

  // 🔹 Join group via Socket.IO and fetch data
  useEffect(() => {
    if (!group || !userId || !isMember) {
      console.log("Skipping socket join, missing group/user or not a member", {
        group,
        userId,
        isMember,
      });
      return;
    }

    console.log("Joining group via socket:", group.id);

    // Join the group
    socket.emit("join_group", { group_id: group.id, user_id: userId });

    // Fetch initial data
    console.log("Requesting group messages, resources, members");
    socket.emit("get_group_messages", { group_id: group.id });
    socket.emit("get_group_resources", { group_id: group.id });
    socket.emit("get_group_members", { group_id: group.id });

    socket.on("group_messages", (data) => {
      console.log("Received group messages:", data);
      if (Array.isArray(data)) setMessages(data);
    });

    socket.on("group_resources_response", (data) => {
      console.log("Received group resources response:", data);
      if (data.success && Array.isArray(data.resources)) setResources(data.resources);
    });

    socket.on("group_members_response", (data) => {
      console.log("Received group members response:", data);
      if (data.success && Array.isArray(data.members)) setMembers(data.members);
    });

    socket.on("new_message", (msg) => {
      console.log("New message received via socket:", msg);
      if (msg.group_id === group.id || msg.sender_id === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("join_group_response", (data) => {
      console.log("Join group response via socket:", data);
      if (data.success) {
        setIsMember(true);
      } else {
        alert(data.error);
      }
    });

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("group_messages");
      socket.off("group_resources_response");
      socket.off("group_members_response");
      socket.off("new_message");
      socket.off("join_group_response");
    };
  }, [group, userId, isMember]);

  // 🔹 Send message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      group_id: group?.id || "UNI",
      sender_id: userId,
      message,
    };

    console.log("Sending message via socket:", msgData);
    socket.emit("send_message", msgData);

    // ✅ Append locally so sender sees it immediately
    const localMsg = {
      ...msgData,
      created_at: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    setMessage("");
  };

  // 🔹 Join group button handler
  const handleJoinGroup = () => {
    if (!group || !userId) return;
    console.log("Join group button clicked", { group_id: group.id, user_id: userId });
    socket.emit("join_group", { group_id: group.id, user_id: userId });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
      case "mp4":
        return <span className="h-5 w-5 text-purple-500">🎥</span>;
      case "image":
        return <span className="h-5 w-5 text-blue-500">🖼️</span>;
      case "pdf":
      case "documents":
        return <span className="h-5 w-5 text-red-500">📄</span>;
      case "mp3":
        return <span className="h-5 w-5 text-green-500">🎵</span>;
      default:
        return <span className="h-5 w-5 text-gray-500">📁</span>;
    }
  };

  if (!group) {
    console.log("No group selected");
    return <div className="max-w-5xl mx-auto p-4 text-center">No group selected.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Group Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 flex items-start justify-between">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">{group.course || "General"} • Owner: {group.owner_id}</p>
            </div>
          </div>

          {!loadingMember && !isMember && (
            <button
              onClick={handleJoinGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Join Group
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Content */}
      {isMember ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {["chat", "resources", "members"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => {
                  console.log("Tab changed to:", tab);
                  setActiveTab(tab);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_id === userId
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          msg.sender_id === userId ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        {msg.created_at || new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="flex items-center">
                  <button type="button" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-2">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      console.log("Message typed:", e.target.value);
                      setMessage(e.target.value);
                    }}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`ml-2 p-2 rounded-full ${
                      message.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Resources */}
          {activeTab === "resources" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg text-gray-900">Shared Resources</h3>
                <button
                  onClick={() => {
                    console.log("Navigate to upload resource for group:", group.id);
                    navigate("/upload", { state: { group_id: group.id } });
                  }}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Upload Resource
                </button>
              </div>
              <div className="space-y-2">
                {resources.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      console.log("Resource clicked:", r);
                      navigate(`/resource/${r.resource_id}`, { state: { resource: r } });
                    }}
                  >
                    {getResourceIcon(r.resource_type)}
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{r.resource_name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by {r.uploader_name} • {r.created_at}
                      </p>
                    </div>
                    {r.resource_url && (
                      <a
                        href={r.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {activeTab === "members" && (
            <div className="p-6">
              <h3 className="font-medium text-lg mb-4 text-gray-900">Group Members</h3>
              {members.length === 0 ? (
                <p className="text-gray-600">No members found.</p>
              ) : (
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li
                      key={m.membership_id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        console.log("Member clicked:", m);
                        navigate(`/profile/${m.user_id}`, { state: { member: m } });
                      }}
                    >
                      <img
                        src={m.profile_pic || "/default-avatar.png"}
                        alt={m.user_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{m.user_name}</p>
                        <p className="text-xs text-gray-500">{m.course_name}</p>
                      </div>
                      {m.is_online && <span className="h-2 w-2 bg-green-500 rounded-full" />}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        !loadingMember && (
          <div className="bg-white p-6 text-center rounded-lg border border-gray-200">
            <p className="text-gray-600">
              You must join this group to access chat, resources, and members.
            </p>
          </div>
        )
      )}
    </div>
  );
};
