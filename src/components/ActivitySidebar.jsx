import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { UserCard } from "./UserCard";

const socket = io("https://studyhub-8req.onrender.com");

export const ActivitySidebar = () => {
  const [activities, setActivities] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    setUserId(storedUser.user_id);

    socket.emit("join", { user_id: storedUser.user_id });
    socket.emit("get_recent_activities", { user_id: storedUser.user_id });
    socket.emit("suggest_students", { user_id: storedUser.user_id });

    // Handle recent activities
    socket.on("recent_activities", (data) => {
      if (data.activities && data.activities.length > 0) {
        const mapped = data.activities
          .map((item) => ({
            id: item.ref_id,
            title: item.title,
            time: new Date(item.created_at).toLocaleString(),
            avatar: item.actor_pic || "",
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivities(mapped);
      } else {
        setActivities([]);
      }
    });

    // Handle suggested students with initial follow/follower info
    socket.on("suggest_students_response", (data) => {
      const formatted = (data.students || []).map((s) => ({
        ...s,
        initialIsFollowing: s.is_following || false,
        initialFollowersCount: s.followers_count || 0,
      }));
      setSuggestedUsers(formatted);
    });

    return () => {
      socket.off("recent_activities");
      socket.off("suggest_students_response");
    };
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-72 border-l border-gray-200 bg-white p-4 h-[calc(100vh-2rem)]">
      {/* Recent Activity - 70% height */}
      <div className="mb-4 flex-[0_0_70%] overflow-y-auto">
        <h3 className="font-medium text-gray-900 mb-2">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length === 0 && (
            <p className="text-gray-400 text-sm">No recent activity</p>
          )}
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <img
                src={
                  activity.avatar
                    ? activity.avatar
                    : "https://via.placeholder.com/40x40.png?text=User"
                }
                alt=""
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="ml-3">
                <p className="text-sm text-gray-700">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Students - 30% height */}
      <div className="flex-[0_0_30%] overflow-y-auto mt-2">
        <h3 className="font-medium text-gray-900 mb-2">Suggested Students</h3>
        <div className="space-y-2">
          {suggestedUsers.length === 0 && (
            <p className="text-gray-400 text-sm">No suggestions</p>
          )}
          {suggestedUsers.map((user) => (
            <UserCard
              key={user.user_id}
              id={user.user_id}
              user_id={user.user_id}
              name={user.name}
              course={user.course_name}
              year={user.year}
              bio={user.bio}
              profilePic={user.profile_pic}
              loggedInUserId={userId}
              socket={socket}
              initialIsFollowing={user.initialIsFollowing}
              initialFollowersCount={user.initialFollowersCount}
              compact
            />
          ))}
        </div>
      </div>
    </aside>
  );
};
