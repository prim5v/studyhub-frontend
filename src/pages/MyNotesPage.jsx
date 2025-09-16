import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const SOCKET_BASE_URL = "https://studyhub-8req.onrender.com";
const socket = io(SOCKET_BASE_URL);

export const MyNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user")) || null;
  const user_id = storedUser?.user_id || null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user_id) return;
    socket.emit("get_my_notes", { user_id });

    socket.on("get_my_notes_response", (data) => {
      setNotes(data.notes || []);
    });

    return () => socket.off("get_my_notes_response");
  }, [user_id]);

  if (!user_id) return <p className="p-6">You must be logged in to view notes.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">My Notes</h1>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.resource_id}
              onClick={() => navigate(`/resource/${note.resource_id}`)} // ✅ click card -> Resource page
              className="cursor-pointer p-5 border rounded-2xl shadow hover:shadow-lg transition bg-gray-50"
            >
              <h2 className="text-lg font-semibold mb-2">{note.resource_name}</h2>
              <p className="text-gray-600 text-sm">Course: {note.course_name}</p>
              <p className="text-gray-600 text-sm">
                Uploaded by: {note.uploader_name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
