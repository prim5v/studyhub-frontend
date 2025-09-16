import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Mail, Phone, Instagram, LogOut } from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { UserCard } from '../components/UserCard';

// Make sure there are NO spaces in the URL
const SOCKET_URL = "https://studyhub-8req.onrender.com"; 
const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

export const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const loggedInUserId = loggedInUser?.user_id;

  console.log("Logged in user:", loggedInUser);

  const profileId = id && id !== "me" ? id : loggedInUserId;
  const isOwnProfile = String(profileId) === String(loggedInUserId);

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('uploads');
  const [userResources, setUserResources] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);

  // ----- Profile Data -----
  useEffect(() => {
    if (!profileId) return;

    console.log("Requesting profile data for:", profileId);
    socket.emit("get_user_profile", {
      user_id: profileId,
      logged_in_user_id: loggedInUserId
    });

    const profileListener = (data) => {
      console.log("Received profile data:", data);
      if (data.user) {
        setUser({
          id: data.user.id,
          user_id: data.user.user_id,
          name: data.user.name,
          course: data.user.course_name,
          year: data.user.year,
          bio: data.user.about || data.user.description,
          contact: {
            email: data.user.email,
            phone: data.user.phone || '',
            instagram: data.user.instagram || ''
          },
          stats: {
            uploads: data.user.upload_count || 0,
            followers: data.user.followers_count || 0,
            following: data.user.following_count || 0
          },
          profile_pic: data.user.profile_pic,
          is_following: data.user.is_following || false
        });
      }
    };

    socket.on("get_user_profile_response", profileListener);
    return () => socket.off("get_user_profile_response", profileListener);
  }, [profileId, loggedInUserId]);

  // ----- Followers / Following -----
  useEffect(() => {
    if (!user) return;

    console.log("Requesting followers and following for:", user.user_id);
    socket.emit("get_user_followers", { user_id: user.user_id, logged_in_user_id: loggedInUserId });
    socket.emit("get_user_following", { user_id: user.user_id, logged_in_user_id: loggedInUserId });

    const followersListener = (data) => {
      console.log("Followers data received:", data);
      setFollowersList(data.followers || []);
    };

    const followingListener = (data) => {
      console.log("Following data received:", data);
      setFollowingList(data.following || []);
    };

    socket.on("get_user_followers_response", followersListener);
    socket.on("get_user_following_response", followingListener);

    return () => {
      socket.off("get_user_followers_response", followersListener);
      socket.off("get_user_following_response", followingListener);
    };
  }, [user, loggedInUserId]);

  // ----- Follow / Unfollow -----
  useEffect(() => {
    const handleFollowResponse = (data) => {
      console.log("Follow response:", data);
      const { following_id, followers_count } = data;
      if (user?.user_id === following_id) {
        setUser(prev => ({ ...prev, is_following: true, stats: { ...prev.stats, followers: followers_count } }));
      }
      setFollowersList(prev => prev.map(u => u.user_id === following_id ? { ...u, is_following: true, followers_count } : u));
      setFollowingList(prev => prev.map(u => u.user_id === following_id ? { ...u, is_following: true, followers_count } : u));
    };

    const handleUnfollowResponse = (data) => {
      console.log("Unfollow response:", data);
      const { following_id, followers_count } = data;
      if (user?.user_id === following_id) {
        setUser(prev => ({ ...prev, is_following: false, stats: { ...prev.stats, followers: followers_count } }));
      }
      setFollowersList(prev => prev.map(u => u.user_id === following_id ? { ...u, is_following: false, followers_count } : u));
      setFollowingList(prev => prev.map(u => u.user_id === following_id ? { ...u, is_following: false, followers_count } : u));
    };

    socket.on("follow_response", handleFollowResponse);
    socket.on("unfollow_response", handleUnfollowResponse);

    return () => {
      socket.off("follow_response", handleFollowResponse);
      socket.off("unfollow_response", handleUnfollowResponse);
    };
  }, [user]);

  const handleFollowToggle = () => {
    if (!loggedInUserId || !user?.user_id || isOwnProfile) return;

    const event = user.is_following ? "unfollow" : "follow";
    console.log(`${event} button clicked`, { follower_id: loggedInUserId, following_id: user.user_id });
    socket.emit(event, { follower_id: loggedInUserId, following_id: user.user_id });

    setUser(prev => ({
      ...prev,
      is_following: !prev.is_following,
      stats: { ...prev.stats, followers: prev.is_following ? prev.stats.followers - 1 : prev.stats.followers + 1 }
    }));
  };

  // ----- Logout -----
  const handleLogout = () => {
    if (!loggedInUserId) return;
    console.log("Logout button clicked for user:", loggedInUserId);
    setLoggingOut(true);
    socket.emit("logout", { user_id: loggedInUserId });
    socket.once("logout_response", (res) => {
      console.log("Logout response:", res);
      setLoggingOut(false);
      if (res.status === "success") {
        localStorage.removeItem("user");
        navigate("/");
      } else {
        alert("Logout failed: " + res.message);
      }
    });
  };

  // ----- Message Button -----
  const handleMessageUser = () => {
    if (!user || !loggedInUserId) return;
    console.log("Message button clicked", { user, loggedInUserId });

    socket.emit("start_private_conversation", { user1_id: loggedInUserId, user2_id: user.user_id });

    socket.once("start_private_conversation_response", (data) => {
      console.log("Start conversation response:", data);
      if (data.success && data.conversation_id) {
        console.log("Navigating to conversation:", data.conversation_id);
        navigate(`/messages/${data.conversation_id}`);
      } else {
        alert("Failed to start conversation.");
      }
    });
  };

  if (!user) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 py-4 relative">
          <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white overflow-hidden flex items-center justify-center">
            <img src={user.profile_pic || "https://via.placeholder.com/150"} alt={user.name} className="h-full w-full object-cover"/>
          </div>
          <div className="ml-28">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.course} • {user.year}</p>
              </div>
              <div className="flex space-x-2">
                {!isOwnProfile && loggedInUserId && (
                  <>
                    <button 
                      onClick={handleFollowToggle} 
                      className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Users className="h-4 w-4" /> {user.is_following ? "Unfollow" : "Follow"}
                    </button>
                    <button 
                      onClick={handleMessageUser}
                      className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <MessageSquare className="h-4 w-4" /> Message
                    </button>
                  </>
                )}
                {isOwnProfile && loggedInUserId && (
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${loggingOut ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-gray-700">{user.bio}</p>

            {/* Contact & Stats */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{user.contact.email}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{user.contact.phone}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Instagram className="h-4 w-4 mr-2 text-gray-500" />
                <span>{user.contact.instagram}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex border-t border-gray-200 pt-4">
              <div className="mr-8">
                <span className="font-bold text-gray-900">{user.stats.uploads}</span>
                <span className="text-gray-600 ml-1">Uploads</span>
              </div>
              <div className="mr-8">
                <span className="font-bold text-gray-900">{user.stats.followers}</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{user.stats.following}</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'uploads' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('uploads')}>Uploads</button>
          <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'followers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('followers')}>Followers & Following</button>
          <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'about' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('about')}>About</button>
        </div>
        <div className="p-6">
          {activeTab === 'uploads' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userResources.map(resource => <ResourceCard key={resource.id} {...resource} loggedInUserId={loggedInUserId} />)}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Followers</h3>
                <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {followersList.length === 0 && <p className="text-gray-500 text-sm">No followers yet.</p>}
                  {followersList.map(follower => (
                    <UserCard
                      key={follower.user_id}
                      id={follower.user_id}
                      user_id={follower.user_id}
                      name={follower.name}
                      course={follower.course_name}
                      year={follower.year}
                      profilePic={follower.profile_pic}
                      loggedInUserId={loggedInUserId}
                      socket={socket}
                      initialIsFollowing={follower.is_following}
                      initialFollowersCount={follower.followers_count}
                      compact
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Following</h3>
                <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {followingList.length === 0 && <p className="text-gray-500 text-sm">Not following anyone yet.</p>}
                  {followingList.map(following => (
                    <UserCard
                      key={following.user_id}
                      id={following.user_id}
                      user_id={following.user_id}
                      name={following.name}
                      course={following.course_name}
                      year={following.year}
                      profilePic={following.profile_pic}
                      loggedInUserId={loggedInUserId}
                      socket={socket}
                      initialIsFollowing={following.is_following}
                      initialFollowersCount={following.followers_count}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Additional profile information will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
