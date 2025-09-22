// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ResourceCard } from "../components/ResourceCard";
import { UserCard } from "../components/UserCard";
import { IntroModal } from "../components/IntroModal";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";

// ------------------ Socket Connection ------------------
const socket = io("https://studyhub-8req.onrender.com", {
  transports: ["websocket"],
});

export const Home = () => {
  const navigate = useNavigate();

  const [trendingResources, setTrendingResources] = useState([]);
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [showIntro, setShowIntro] = useState(false);

  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user")) || null;
  const user_id = storedUser?.user_id || null;

  // Fixed heights to fit 3 cards vertically
  const resourceMaxHeight = "900px";
  const studentMaxHeight = "540px";

  // ------------------ Intro Modal ------------------
  useEffect(() => {
    if (!user_id) return;
    const introPlayed = localStorage.getItem("introPlayed");
    if (!introPlayed) setShowIntro(true);
  }, [user_id]);

  // ------------------ Fetch Data ------------------
  useEffect(() => {
    if (!user_id) return;

    setLoadingResources(true);
    setLoadingStudents(true);

    socket.emit("trending_resources", { user_id });
    socket.on("trending_resources_response", (resources) => {
      const formatted = (resources || []).map((r) => ({
        id: r.resource_id,
        title: r.resource_name,
        type: r.resource_type,
        subject: r.course_name,
        uploadedBy: { id: r.sender_id, name: r.uploader_name || "Unknown" },
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
        likes: r.like_count || 0,
        comments: r.comment_count || 0,
        isFavorite: r.isFavorite || 0,
        hasLiked: r.has_liked || false,
        resourceUrl: r.resource_url || null,
      }));
      setTrendingResources(formatted);
      setLoadingResources(false);
    });

    socket.emit("suggest_students", { user_id });
    socket.on("suggest_students_response", (data) => {
      const formatted = (data.students || []).map((s) => ({
        id: s.id,
        user_id: s.user_id,
        name: s.name,
        course: s.course_name || "",
        year: s.year || "",
        bio: s.bio || "",
        profilePic:
          s.profile_pic || "https://via.placeholder.com/40x40.png?text=User",
        is_following: Boolean(s.is_following),
        followers_count: s.followers_count || 0,
      }));
      setSuggestedStudents(formatted);
      setLoadingStudents(false);
    });

    socket.on("like_response", ({ resource_id, like_count, has_liked }) => {
      setTrendingResources((prev) =>
        prev.map((r) =>
          r.id === resource_id ? { ...r, likes: like_count, hasLiked: has_liked } : r
        )
      );
    });

    socket.on("comment_response", ({ comment }) => {
      setTrendingResources((prev) =>
        prev.map((r) =>
          r.id === comment.resource_id ? { ...r, comments: r.comments + 1 } : r
        )
      );
    });

    return () => {
      socket.off("trending_resources_response");
      socket.off("suggest_students_response");
      socket.off("like_response");
      socket.off("comment_response");
    };
  }, [user_id]);

  // ------------------ Follow/Unfollow ------------------
  const updateStudentFollowState = (following_id, isFollowing, followersCount) => {
    setSuggestedStudents((prev) =>
      prev.map((s) =>
        s.user_id === following_id
          ? { ...s, is_following: isFollowing, followers_count: followersCount }
          : s
      )
    );
  };

  useEffect(() => {
    socket.on("follow_response", (data) => {
      if (data.status === "success") {
        updateStudentFollowState(data.following_id, true, data.followers_count);
      }
    });

    socket.on("unfollow_response", (data) => {
      if (data.status === "success") {
        updateStudentFollowState(data.following_id, false, data.followers_count);
      }
    });

    return () => {
      socket.off("follow_response");
      socket.off("unfollow_response");
    };
  }, []);

  // ------------------ UI Handlers ------------------
  const handleLike = (resource_id) => {
    if (!user_id) return;
    socket.emit("like_resource", { user_id, resource_id });
  };

  const handleFavorite = (resource_id, isFavorite) => {
    if (!user_id) return;
    const newFavorite = isFavorite ? 0 : 1;
    socket.emit("update_favorite", { user_id, resource_id, isFavorite: newFavorite });
    setTrendingResources((prev) =>
      prev.map((r) => (r.id === resource_id ? { ...r, isFavorite: newFavorite } : r))
    );
  };

  const openProfile = (student) => {
    navigate(`/profile/${student.user_id}`);
  };

  // ------------------ Skeleton Loaders ------------------
  const ResourceSkeleton = () => (
    <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  );

  const StudentSkeleton = () => (
    <div className="animate-pulse flex items-center gap-4 bg-gray-200 p-4 rounded-lg h-20"></div>
  );

  // ------------------ UI ------------------
  return (
    <div className="max-w-6xl mx-auto space-y-12 p-6">
      {/* Welcome Banner */}
      {storedUser && (
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-md text-white">
          <h2 className="text-xl font-bold">
            Welcome back, {storedUser.name || "Student"} 👋
          </h2>
          <p className="text-sm opacity-90">Ready to learn something new today?</p>
        </div>
      )}

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntro}
        onClose={() => {
          setShowIntro(false);
          localStorage.setItem("introPlayed", "true");
        }}
      />

      {/* Trending Resources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-indigo-600 w-6 h-6" />
          <h2 className="text-2xl font-extrabold text-gray-800">Resources for You</h2>
        </div>
        <div
          className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 bg-white rounded-xl shadow-inner"
          style={{ maxHeight: resourceMaxHeight }}
        >
          {loadingResources ? (
            [...Array(3)].map((_, i) => <ResourceSkeleton key={i} />)
          ) : trendingResources.length === 0 ? (
            <p className="text-gray-500">No resources available.</p>
          ) : (
            trendingResources.map((resource) => (
              <div
                key={resource.id}
                className="transform transition hover:scale-105 hover:shadow-lg rounded-lg"
              >
                <ResourceCard
                  {...resource}
                  onLike={() => handleLike(resource.id)}
                  onFavorite={() => handleFavorite(resource.id, resource.isFavorite)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Suggested Students */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-blue-600 w-6 h-6" />
          <h2 className="text-2xl font-extrabold text-gray-800">Students to Follow</h2>
        </div>
        <div
          className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-2 bg-white rounded-xl shadow-inner"
          style={{ maxHeight: studentMaxHeight }}
        >
          {loadingStudents ? (
            [...Array(3)].map((_, i) => <StudentSkeleton key={i} />)
          ) : suggestedStudents.length === 0 ? (
            <p className="text-gray-500">No students available.</p>
          ) : (
            suggestedStudents.map((student) => (
              <div
                key={student.id}
                className="transform transition hover:scale-105 hover:shadow-lg rounded-lg"
              >
                <UserCard
                  {...student}
                  profilePic={student.profilePic}
                  loggedInUserId={user_id}
                  socket={socket}
                  initialIsFollowing={student.is_following}
                  initialFollowersCount={student.followers_count}
                  onClick={() => openProfile(student)}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
