import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

// ⚡ change to your backend base URL
const socket = io("https://studyhub-8req.onrender.com");

export const Grouping = () => {
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ group_name: "", course: "" });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // ✅ user from login
  const userId = user?.user_id;

  // 🔹 Fetch groups
  useEffect(() => {
    if (!userId) return;
    socket.emit("get_group_conversations", { user_id: userId });

    socket.on("group_conversations", (data) => {
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        console.error("Error fetching groups:", data);
      }
    });

    return () => {
      socket.off("group_conversations");
    };
  }, [userId]);

  // 🔹 Handle group creation
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroup.group_name) return alert("Group name is required");

    socket.emit("create_group", { ...newGroup, user_id: userId });

    socket.once("create_group_response", (res) => {
      if (res.success) {
        alert("Group created ✅");
        setGroups((prev) => [...prev, res]);
        setShowCreate(false);
        setNewGroup({ group_name: "", course: "" });
      } else {
        alert("Error: " + res.error);
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-600" />
          My Groups
        </h1>
        <Button
          onClick={() => setShowCreate(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> New Group
        </Button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <p className="text-gray-500">No groups yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`, { state: { group } })}
              className="p-4 border rounded-lg shadow hover:shadow-md cursor-pointer transition bg-white"
            >
              <h2 className="text-lg font-semibold text-gray-800">{group.name}</h2>
              <p className="text-sm text-gray-600">{group.course}</p>
              <p className="text-sm text-gray-500 mt-1">
                {group.lastMessage || "No messages yet"}
              </p>
              {group.unread_count > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  {group.unread_count} unread
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Group Name"
                value={newGroup.group_name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, group_name: e.target.value })
                }
                required
              />
              <Input
                label="Course"
                value={newGroup.course}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, course: e.target.value })
                }
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
