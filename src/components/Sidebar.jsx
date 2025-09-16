// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Users, MessageSquare, Heart, Plus } from "lucide-react";
import socket from "../socket";

const Sidebar = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: FileText, label: "My Notes", path: "/notes" },
    { icon: Users, label: "Study Groups", path: "/groups" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    // { icon: Heart, label: "Favorites", path: "/favorites" },
  ];

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) return; // user not logged in
    const userId = parseInt(storedUserId, 10);

    socket.emit("get_my_groupe_list", { user_id: userId });

    socket.on("my_groups_response", (data) => {
      console.log("Groups received:", data);

      // Normalize the data to always be an array
      let groupArray = [];
      if (Array.isArray(data)) {
        groupArray = data;
      } else if (data && Array.isArray(data.groups)) {
        groupArray = data.groups;
      }

      // Map to expected keys
      const normalized = groupArray.map((g) => ({
        id: g.group_id || g.id || g.ID,
        name: g.group_name || g.name || "Unnamed Group",
      }));

      setGroups(normalized);
    });

    return () => {
      socket.off("my_groups_response");
    };
  }, []);

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
                className={`flex items-center px-4 py-3 rounded-lg ${
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
