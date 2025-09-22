// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, MessageSquare, Plus } from "lucide-react";
import socket from "../socket";

const Sidebar = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bounceBadge, setBounceBadge] = useState(false);

  const storedUserId = parseInt(localStorage.getItem("user_id"), 10);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: FileText, label: "My Notes", path: "/notes" },
    { icon: MessageSquare, label: "Public Chat", path: "/public-chat" },
  ];

  // Load groups
  useEffect(() => {
    if (!storedUserId) return;

    socket.emit("get_my_groupe_list", { user_id: storedUserId });

    socket.on("my_groups_response", (data) => {
      let groupArray = [];
      if (Array.isArray(data)) groupArray = data;
      else if (data && Array.isArray(data.groups)) groupArray = data.groups;

      const normalized = groupArray.map((g) => ({
        id: g.group_id || g.id || g.ID,
        name: g.group_name || g.name || "Unnamed Group",
      }));

      setGroups(normalized);
    });

    return () => {
      socket.off("my_groups_response");
    };
  }, [storedUserId]);

  // Join PUBLIC room
  useEffect(() => {
    socket.emit("join_public_room");
    return () => {
      socket.emit("leave_public_room");
    };
  }, []);

  // Listen for new public messages
  useEffect(() => {
    const handleNewPublicMessage = (msg) => {
      // Ignore messages sent by yourself
      if (msg.sender_id === storedUserId) return;

      // play pop sound
      const audio = new Audio("/pop.wav");
      audio.play().catch(() => {});

      if (location.pathname !== "/public-chat") {
        setUnreadCount((prev) => prev + 1);

        // trigger badge bounce
        setBounceBadge(true);
        setTimeout(() => setBounceBadge(false), 600);
      }
    };

    socket.on("new_public_message", handleNewPublicMessage);

    return () => {
      socket.off("new_public_message", handleNewPublicMessage);
    };
  }, [location.pathname, storedUserId]);

  // Reset count when visiting Public Chat
  useEffect(() => {
    if (location.pathname === "/public-chat") setUnreadCount(0);
  }, [location.pathname]);

  return (
    <aside className="hidden md:flex w-64 border-r border-gray-200 bg-white p-4 flex-col">
      {/* Upload Button */}
      <Link
        to="/upload"
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium mb-6 hover:opacity-90 transition-opacity"
      >
        <Plus className="h-5 w-5" />
        <span>Upload Resource</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-lg ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    isActive(item.path) ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span className="ml-3 font-medium">{item.label}</span>

                {/* 🔴 Badge */}
                {item.path === "/public-chat" && unreadCount > 0 && (
                  <span
                    className={`absolute right-3 top-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full transition-transform ${
                      bounceBadge ? "animate-bounce" : ""
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Groups */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Study Groups
          </h3>
        </div>
        <ul className="mt-2 space-y-1">
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <li key={index}>
                <Link
                  to={`/group/${group.id}`}
                  className="flex items-center px-4 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-3"></span>
                  <span className="truncate">{group.name}</span>
                </Link>
              </li>
            ))
          ) : (
            <p className="px-4 text-sm text-gray-500">No groups found</p>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
