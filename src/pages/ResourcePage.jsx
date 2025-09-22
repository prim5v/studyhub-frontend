import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Trash2,
  Download,
} from "lucide-react";

// ✅ Change this base URL when deploying
const SOCKET_BASE_URL = "https://studyhub-8req.onrender.com";
const socket = io(SOCKET_BASE_URL);

export const ResourcePage = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [newComment, setNewComment] = useState("");
  const commentsRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem("user")) || null;
  const user_id = storedUser?.user_id || null;

  // ------------------ Fetch resource ------------------
  useEffect(() => {
    if (!id || !user_id) return;

    console.log("[DEBUG] Requesting resource:", { resource_id: id, user_id });
    socket.emit("get_resource", { resource_id: id, user_id });

    const handleGetResource = (data) => {
      console.log("[DEBUG] Received resource from backend:", data);

      if (!data?.resource) return;

      setResource({
        id: data.resource.resource_id,
        title: data.resource.title,
        type: data.resource.type,
        subject: data.resource.subject,
        fileUrl: data.resource.url || null,
        uploadedBy: data.resource.uploadedBy,
        date: data.resource.created_at
          ? new Date(data.resource.created_at).toLocaleDateString()
          : "",
        likes: data.resource.likes || 0,
        comments: data.resource.comments || [],
        isFavorite: data.resource.isFavorite || 0,
        hasLiked: data.resource.hasLiked || false,
      });
    };

    socket.on("get_resource_response", handleGetResource);
    return () => socket.off("get_resource_response", handleGetResource);
  }, [id, user_id]);

  // ------------------ Real-time updates ------------------
  useEffect(() => {
    const handleLikeResponse = ({ resource_id, like_count, has_liked }) => {
      setResource((prev) =>
        prev && prev.id === resource_id
          ? { ...prev, likes: like_count, hasLiked: has_liked }
          : prev
      );
    };

    const handleCommentResponse = ({ comment }) => {
      if (!comment) return;
      setResource((prev) => {
        if (!prev || prev.id !== comment.resource_id) return prev;
        const updatedComments = prev.comments.map((c) =>
          c.id.toString().startsWith("temp-") &&
          c.user_id === comment.user_id &&
          c.comment === comment.comment
            ? comment
            : c
        );
        if (!updatedComments.some((c) => c.id === comment.id)) {
          updatedComments.unshift(comment);
        }
        return { ...prev, comments: updatedComments };
      });
      if (commentsRef.current) commentsRef.current.scrollTop = 0;
    };

    const handleDeleteComment = ({ comment_id }) => {
      setResource((prev) =>
        prev
          ? { ...prev, comments: prev.comments.filter((c) => c.id !== comment_id) }
          : prev
      );
    };

    const handleFavoriteResponse = ({ resource_id, isFavorite }) => {
      setResource((prev) =>
        prev && prev.id === resource_id ? { ...prev, isFavorite } : prev
      );
    };

    const handleSaveNoteResponse = (data) => {
      if (data.success) {
        alert(data.message); // ✅ "Saved to My Notes collection"
      }
    };

    socket.on("like_response", handleLikeResponse);
    socket.on("comment_response", handleCommentResponse);
    socket.on("delete_comment_response", handleDeleteComment);
    socket.on("update_favorite_response", handleFavoriteResponse);
    socket.on("save_note_response", handleSaveNoteResponse);

    return () => {
      socket.off("like_response", handleLikeResponse);
      socket.off("comment_response", handleCommentResponse);
      socket.off("delete_comment_response", handleDeleteComment);
      socket.off("update_favorite_response", handleFavoriteResponse);
      socket.off("save_note_response", handleSaveNoteResponse);
    };
  }, []);

  // ------------------ Handlers ------------------
  const handleLike = () => {
    if (!user_id || !resource) return;
    socket.emit("like_resource", { user_id, resource_id: resource.id });
  };

  const handleFavorite = () => {
    if (!user_id || !resource) return;

    // 1. Toggle favorite
    socket.emit("update_favorite", {
      user_id,
      resource_id: resource.id,
      isFavorite: resource.isFavorite ? 0 : 1,
    });

    // 2. Save to notes if marking as favorite
    if (!resource.isFavorite) {
      socket.emit("save_note", { user_id, resource_id: resource.id });
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user_id || !resource || !newComment.trim()) return;

    const tempComment = {
      id: "temp-" + Date.now(),
      user_id,
      user_name: storedUser?.name || "You",
      comment: newComment,
      created_at: new Date().toISOString(),
      resource_id: resource.id,
    };

    setResource((prev) => ({
      ...prev,
      comments: [tempComment, ...prev.comments],
    }));

    setNewComment("");
    if (commentsRef.current) commentsRef.current.scrollTop = 0;

    socket.emit("add_comment", {
      user_id,
      resource_id: resource.id,
      content: tempComment.comment,
    });
  };

  const handleDeleteComment = (comment_id) => {
    setResource((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== comment_id),
    }));
    socket.emit("delete_comment", { comment_id });
  };

  if (!resource) return <p className="p-6">Loading resource...</p>;

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow flex gap-8">
      {/* LEFT SIDE - Details + Comments */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>
        <p className="text-lg text-gray-700 mb-2">Unit: {resource.subject}</p>
        <p className="text-lg text-gray-700 mb-2">
          Uploaded by: {resource.uploadedBy?.name || "Unknown"}
        </p>
        <p className="text-sm text-gray-500 mb-6">{resource.date}</p>

        {/* Actions */}
        <div className="flex items-center space-x-6 mb-6">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center text-lg ${
              resource.hasLiked
                ? "text-red-500"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <ThumbsUp className="h-6 w-6 mr-1" />
            {resource.likes}
          </button>

          <button
            type="button"
            onClick={handleFavorite}
            className={`flex items-center text-lg ${
              resource.isFavorite ? "text-yellow-400" : "text-gray-600"
            }`}
          >
            <Bookmark className="h-6 w-6 mr-1" />
            {resource.isFavorite ? "Unfavorite" : "Favorite"}
          </button>

          <span className="flex items-center text-lg text-gray-600">
            <MessageSquare className="h-6 w-6 mr-1" />
            {resource.comments.length}
          </span>
        </div>

        {/* Add Comment */}
        <form className="mt-6 mb-6" onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-3 mb-2"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Post Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-3">Comments</h2>
          <div
            ref={commentsRef}
            className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-4"
          >
            {resource.comments.length === 0 ? (
              <p className="text-gray-500">No comments yet</p>
            ) : (
              resource.comments.map((c) => {
                const isOwn = c.user_id === user_id;
                return (
                  <div
                    key={c.id}
                    className="border-b pb-2 flex justify-between items-start"
                  >
                    <div>
                      <p className="text-gray-800">
                        <span className="font-semibold">
                          {isOwn ? "You" : c.user_name}
                        </span>
                        : {c.comment}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString()
                          : ""}
                      </p>
                    </div>
                    {isOwn && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="ml-4 text-red-500 hover:text-red-700"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Preview + Download */}
      <div className="w-1/3 border-l pl-6">
        <h3 className="font-semibold mb-2">Preview</h3>

        {resource.fileUrl && (
          <div className="space-y-4">
            {resource.type?.startsWith("image") ? (
              <img
                src={resource.fileUrl}
                alt={resource.title}
                className="max-w-full h-auto rounded-lg shadow"
              />
            ) : resource.type?.startsWith("video") ? (
              <video controls className="w-full rounded-lg shadow">
                <source src={resource.fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : resource.type?.startsWith("audio") ? (
              <audio controls className="w-full">
                <source src={resource.fileUrl} type="audio/mp3" />
                Your browser does not support the audio tag.
              </audio>
            ) : (
              <iframe
                src={resource.fileUrl}
                title={resource.title}
                className="w-full h-[400px] border rounded-lg shadow"
              />
            )}

            {/* ✅ Download button */}
            <a
              href={resource.fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              <Download className="h-5 w-5 mr-2" /> Open
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
