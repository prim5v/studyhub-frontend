// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { ResourceCard } from "../components/ResourceCard";
import { StudyGroupCard } from "../components/StudyGroupCard";
import { UserCard } from "../components/UserCard";
import { IntroModal } from "../components/IntroModal";
import { useNavigate } from "react-router-dom";

// Connect socket
const socket = io("https://studyhub-8req.onrender.com");

export const Home = () => {
  const navigate = useNavigate();

  const [trendingResources, setTrendingResources] = useState([]);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [showIntro, setShowIntro] = useState(false); // <-- for IntroModal

  const storedUser = JSON.parse(localStorage.getItem("user")) || null;
  const user_id = storedUser?.user_id || null;

  const resourceCardRef = useRef(null);
  const groupCardRef = useRef(null);
  const studentCardRef = useRef(null);

  const [resourceMaxHeight, setResourceMaxHeight] = useState("300px");
  const [groupMaxHeight, setGroupMaxHeight] = useState("250px");
  const [studentMaxHeight, setStudentMaxHeight] = useState("180px");

  // ------------------ Check introPlayed ------------------
  useEffect(() => {
    if (!user_id) return;

    const introPlayed = localStorage.getItem("introPlayed");
    console.log("introPlayed in localStorage:", introPlayed);
    if (!introPlayed) {
      setShowIntro(true); // show intro modal on first login
    }
  }, [user_id]);

  // ------------------ Fetch Data ------------------
  useEffect(() => {
    if (!user_id) return;

    console.log("Home mounted, fetching data for user_id:", user_id);

    // ------------------ Trending Resources ------------------
    socket.emit("trending_resources", { user_id });
    socket.on("trending_resources_response", (resources) => {
      console.log("Received trending_resources_response:", resources);
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

      setTimeout(() => {
        if (resourceCardRef.current) {
          setResourceMaxHeight(resourceCardRef.current.offsetHeight + 20 + "px");
        }
      }, 100);
    });

    // ------------------ Suggested Groups ------------------
    socket.emit("suggest_groups", { user_id });
    socket.on("suggest_groups_response", (data) => {
      console.log("Received suggest_groups_response:", data);
      const formatted = (data.groups || []).map((g) => ({
        id: g.group_id,
        name: g.group_name,
        subject: g.course_name || "",
        memberCount: g.total_members || 0,
        activeNow: g.online_members || 0,
      }));
      setSuggestedGroups(formatted);

      setTimeout(() => {
        if (groupCardRef.current) {
          setGroupMaxHeight(groupCardRef.current.offsetHeight + 20 + "px");
        }
      }, 100);
    });

    // ------------------ Suggested Students ------------------
    socket.emit("suggest_students", { user_id });
    socket.on("suggest_students_response", (data) => {
      console.log("Received suggest_students_response:", data);
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

      setTimeout(() => {
        if (studentCardRef.current) {
          setStudentMaxHeight(studentCardRef.current.offsetHeight + 20 + "px");
        }
      }, 100);
    });

    // ------------------ Real-time Updates ------------------
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

    // ------------------ Cleanup ------------------
    return () => {
      socket.off("trending_resources_response");
      socket.off("suggest_groups_response");
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

  const openGroup = (group) => {
    navigate(`/groups/${group.id}`, { state: { group } });
  };

  const openProfile = (student) => {
    navigate(`/profile/${student.user_id}`);
  };

  // ------------------ UI ------------------
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {storedUser && (
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {storedUser.name || "Student"} 👋
          </h2>
        </div>
      )}

      {/* Intro Modal */}
      <IntroModal
        isOpen={showIntro}
        onClose={() => {
          setShowIntro(false);
          localStorage.setItem("introPlayed", "true"); // mark intro as played
        }}
      />

      {/* Trending Resources */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Resources</h2>
        <div
          className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ maxHeight: resourceMaxHeight }}
        >
          {trendingResources.length === 0 ? (
            <p>No resources available.</p>
          ) : (
            trendingResources.map((resource, index) => (
              <div key={resource.id} ref={index === 0 ? resourceCardRef : null}>
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

      {/* Suggested Groups */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Suggested Study Groups</h2>
        <div
          className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ maxHeight: groupMaxHeight }}
        >
          {suggestedGroups.length === 0 ? (
            <p>No groups available.</p>
          ) : (
            suggestedGroups.map((group, index) => (
              <div
                key={group.id}
                ref={index === 0 ? groupCardRef : null}
                onClick={() => openGroup(group)}
                className="cursor-pointer"
              >
                <StudyGroupCard {...group} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Suggested Students */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Students to Follow</h2>
        <div
          className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ maxHeight: studentMaxHeight }}
        >
          {suggestedStudents.length === 0 ? (
            <p>No students available.</p>
          ) : (
            suggestedStudents.map((student, index) => (
              <div key={student.id} ref={index === 0 ? studentCardRef : null}>
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
