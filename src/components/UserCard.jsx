import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UserCard = ({
  id,
  user_id,
  name,
  course,
  year,
  bio,
  profilePic,
  loggedInUserId,         // currently logged-in user
  socket,                 // Socket.IO instance
  initialIsFollowing = false,
  initialFollowersCount = 0,
  compact = false         // compact style toggle
}) => {
  const navigate = useNavigate();
  const avatarSrc = profilePic || "https://via.placeholder.com/40x40.png?text=User";

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  // Listen for follow/unfollow responses
  useEffect(() => {
    if (!socket || !loggedInUserId) return;

    const handleFollowResponse = (data) => {
      if (data.status === "success" && data.following_id === user_id) {
        setIsFollowing(true);
        setFollowersCount(data.followers_count);
      }
    };

    const handleUnfollowResponse = (data) => {
      if (data.status === "success" && data.following_id === user_id) {
        setIsFollowing(false);
        setFollowersCount(data.followers_count);
      }
    };

    socket.on("follow_response", handleFollowResponse);
    socket.on("unfollow_response", handleUnfollowResponse);

    return () => {
      socket.off("follow_response", handleFollowResponse);
      socket.off("unfollow_response", handleUnfollowResponse);
    };
  }, [socket, user_id, loggedInUserId]);

  // Follow/unfollow click
  const handleFollowToggle = (e) => {
    e.stopPropagation(); // Prevent triggering profile navigation
    if (!loggedInUserId || !user_id) return;

    if (isFollowing) {
      socket.emit("unfollow", { follower_id: loggedInUserId, following_id: user_id });
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      socket.emit("follow", { follower_id: loggedInUserId, following_id: user_id });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  // Navigate to profile
  const viewProfile = () => {
    navigate(`/profile/${user_id || id}`);
  };

  // Compact card JSX
  const CompactCard = () => (
    <div
      className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-3 py-2 hover:shadow-md transition cursor-pointer"
      onClick={viewProfile}
    >
      <div className="flex items-center gap-3">
        <img src={avatarSrc} alt={name} className="h-10 w-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{course} • {year}</p>
        </div>
      </div>
      {loggedInUserId && user_id !== loggedInUserId && (
        <button
          onClick={handleFollowToggle}
          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
            isFollowing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );

  // Regular card JSX
  const RegularCard = () => (
    <div className="flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 shadow hover:shadow-lg transition">
      <div className="p-4">
        <div className="flex items-center">
          <img src={avatarSrc} alt={name} className="h-12 w-12 rounded-full object-cover" />
          <div className="ml-3">
            <p className="font-medium text-lg text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{course} • {year}</p>
          </div>
        </div>
        {bio && <p className="mt-2 text-sm text-gray-600">{bio}</p>}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={viewProfile}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Profile
        </button>

        {loggedInUserId && user_id !== loggedInUserId && (
          <button
            onClick={handleFollowToggle}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
              isFollowing
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {followersCount > 0 && (
        <div className="px-4 pb-2 text-xs text-gray-500">
          {followersCount} follower{followersCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );

  return compact ? <CompactCard /> : <RegularCard />;
};
