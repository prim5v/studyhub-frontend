import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, User, Menu } from "lucide-react";
import { io } from "socket.io-client";

// Connect to your Flask-SocketIO backend
const socket = io("https://studyhub-8req.onrender.com");

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [followers, setFollowers] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);

  const navigate = useNavigate();
  const followersRef = useRef(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = loggedInUser?.user_id;

  // Track clicks outside followers dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        followersRef.current &&
        !followersRef.current.contains(event.target)
      ) {
        setShowFollowers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket.IO: listen for followers
  useEffect(() => {
    if (!loggedInUserId) return;

    console.log("Emitting logged-in user ID to backend:", loggedInUserId);
    socket.emit("listen-followers", loggedInUserId);

    socket.on("followers-update", (data) => {
      console.log("Received followers update from backend:", data);
      setFollowers(data);
    });

    return () => socket.off("followers-update");
  }, [loggedInUserId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
          >
            StudyHub
          </Link>

          {/* Search */}
          <form
            className="hidden md:flex flex-1 mx-8 relative"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search notes, groups, students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </form>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Followers / Notifications */}
            <div className="relative" ref={followersRef}>
              <button
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                onClick={() => setShowFollowers(!showFollowers)}
              >
                <Bell className="h-6 w-6" />
                {followers.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                    {followers.length}
                  </span>
                )}
              </button>

              {/* Followers dropdown */}
              {showFollowers && (
                <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                  {followers.length === 0 ? (
                    <p className="p-4 text-gray-500">No new followers</p>
                  ) : (
                    followers.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={f.profile_pic || "/default-avatar.png"}
                            alt="Follower"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium">{f.name || f.followers_id}</span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(f.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Chat */}
            <Link
              to="/public-chat"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="h-6 w-6" />
            </Link>

            {/* Profile */}
            <Link
              to={loggedInUserId ? `/profile/${loggedInUserId}` : "/profile/me"}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
