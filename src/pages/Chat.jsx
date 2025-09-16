import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Paperclip, Image, Smile, Send, Users } from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = "https://studyhub-8req.onrender.com";
const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

export const Chat = () => {
  const { conversationId } = useParams();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const loggedInUserId = storedUser?.user_id;

  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [highlighted, setHighlighted] = useState(null);
  const [activeUserInfo, setActiveUserInfo] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Join main room & mark online
  useEffect(() => {
    if (!loggedInUserId) return;
    console.log("Joining main room for user:", loggedInUserId);
    socket.emit('join_room', { room: loggedInUserId });
    socket.emit('user_online', { user_id: loggedInUserId });
  }, [loggedInUserId]);

  // Listen for user status updates
  useEffect(() => {
    const handleUserStatus = (status) => {
      if (activeChat?.type === 'private' && activeChat.receiver_user_id === status.user_id) {
        console.log("User status updated:", status);
        setActiveUserInfo(prev => ({ ...prev, ...status }));
      }
    };
    socket.on('user_status', handleUserStatus);
    return () => socket.off('user_status', handleUserStatus);
  }, [activeChat]);

  // Fetch conversations
  useEffect(() => {
    if (!loggedInUserId) return;

    socket.emit('get_private_conversations', { user_id: loggedInUserId });
    socket.emit('get_group_conversations', { user_id: loggedInUserId });

    const handlePrivateConvos = (data = []) => {
      const privateConvos = data.map(c => ({
        ...c,
        type: 'private',
        uniqueId: `private-${c.conversation_id || c.id}`
      }));
      console.log("Private conversations loaded:", privateConvos);
      setConversations(prev => {
        const groupConvos = prev.filter(c => c.type === 'group');
        return [...privateConvos, ...groupConvos].sort(
          (a, b) => new Date(b.lastMessageTime || b.lastMessage_time) - new Date(a.lastMessageTime || a.lastMessage_time)
        );
      });
    };

    const handleGroupConvos = (data = []) => {
      const groupConvos = data.map(c => ({
        ...c,
        type: 'group',
        uniqueId: `group-${c.id}`
      }));
      console.log("Group conversations loaded:", groupConvos);
      setConversations(prev => {
        const privateConvos = prev.filter(c => c.type === 'private');
        return [...privateConvos, ...groupConvos].sort(
          (a, b) => new Date(b.lastMessageTime || b.lastMessage_time) - new Date(a.lastMessageTime || a.lastMessage_time)
        );
      });
    };

    socket.on('private_conversations', handlePrivateConvos);
    socket.on('group_conversations', handleGroupConvos);

    return () => {
      socket.off('private_conversations', handlePrivateConvos);
      socket.off('group_conversations', handleGroupConvos);
    };
  }, [loggedInUserId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (!msg) return;
      console.log("New message received:", msg);

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, time: msg.created_at || new Date().toLocaleTimeString() }]
          .sort((a, b) => new Date(a.time) - new Date(b.time));
      });

      // Update unread counts if not active chat
      const isNotActiveChat =
        !activeChat ||
        !(
          (msg.sender_id === activeChat.receiver_user_id || msg.receiver_id === activeChat.receiver_user_id) ||
          msg.group_id === activeChat.id
        );

      if (isNotActiveChat) {
        const key = msg.group_id === 'UNI' ? `private-${msg.sender_id}` : `group-${msg.group_id}`;
        setUnreadCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        setHighlighted(key);
        setTimeout(() => setHighlighted(null), 1000);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [activeChat]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    setOffset(0);
    setMessages([]);

    const event = activeChat.type === 'private' ? 'get_private_messages' : 'get_group_messages';
    const payload =
      activeChat.type === 'private'
        ? { sender_id: loggedInUserId, receiver_id: activeChat.receiver_user_id, limit: 20, offset: 0 }
        : { group_id: activeChat.id, limit: 20, offset: 0 };

    console.log("Fetching messages for active chat:", payload);
    socket.emit(event, payload);

    const msgEvent = activeChat.type === 'private' ? 'private_messages' : 'group_messages';
    const handleMessages = (msgs = []) => {
      const sorted = msgs.map(m => ({ ...m, time: m.created_at })).sort((a, b) => new Date(a.time) - new Date(b.time));
      setMessages(sorted);
      setUnreadCounts(prev => ({ ...prev, [activeChat.uniqueId]: 0 }));
      setLoadingMore(false);
      console.log("Messages loaded:", sorted);
    };
    socket.on(msgEvent, handleMessages);

    if (activeChat.type === 'private') {
      socket.emit('get_user_info', { user_id: activeChat.receiver_user_id });
      socket.on('user_info', setActiveUserInfo);
    } else {
      setActiveUserInfo(null);
    }

    return () => {
      socket.off(msgEvent, handleMessages);
      socket.off('user_info', setActiveUserInfo);
    };
  }, [activeChat, loggedInUserId, offset]);

  // Submit message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const receiverId =
      activeChat.type === 'private'
        ? activeChat.user1_id === loggedInUserId
          ? activeChat.user2_id
          : activeChat.user1_id
        : null;

    const msgData = {
      sender_id: loggedInUserId,
      receiver_id: receiverId,
      group_id: activeChat.type === 'group' ? activeChat.id : 'UNI',
      message
    };
    console.log("Sending message:", msgData);
    socket.emit('send_message', msgData);
    setMessage('');
  };

  const handleSelectConversation = (conv) => {
    const receiver_user_id = conv.type === 'private'
      ? conv.user1_id === loggedInUserId ? conv.user2_id : conv.user1_id
      : null;
    setActiveChat({ ...conv, receiver_user_id });
    setUnreadCounts(prev => ({ ...prev, [conv.uniqueId]: 0 }));
    console.log("Active chat selected:", conv);
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !loadingMore) {
      setLoadingMore(true);
      const newOffset = offset + 20;
      setOffset(newOffset);

      const event = activeChat.type === 'private' ? 'get_private_messages' : 'get_group_messages';
      const payload =
        activeChat.type === 'private'
          ? { sender_id: loggedInUserId, receiver_id: activeChat.receiver_user_id, limit: 20, offset: newOffset }
          : { group_id: activeChat.id, limit: 20, offset: newOffset };

      console.log("Fetching older messages:", payload);
      socket.emit(event, payload);
    }
  };

  const formatLastSeen = (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : '';

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.uniqueId}
              onClick={() => handleSelectConversation(conv)}
              className={`flex items-center p-4 cursor-pointer border-b border-gray-100
                ${activeChat?.uniqueId === conv.uniqueId ? 'bg-blue-50' : ''} 
                ${highlighted === conv.uniqueId ? 'bg-yellow-100 animate-pulse' : ''} 
                hover:bg-gray-50`}
            >
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                {conv.type === 'group' ? <Users className="h-5 w-5" /> : conv.name?.charAt(0)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-900 truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500">{conv.lastMessageTime || conv.lastMessage_time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
              {unreadCounts[conv.uniqueId] > 0 && (
                <div className="ml-2 bg-blue-600 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full">
                  {unreadCounts[conv.uniqueId]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                {activeChat.type === 'group' ? <Users className="h-5 w-5" /> : activeChat.name?.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">{activeChat.name}</h3>
                {activeChat.type === 'private' && activeUserInfo && (
                  <p className="text-xs text-gray-500">
                    {activeUserInfo.is_online ? 'Online' : `Last seen: ${formatLastSeen(activeUserInfo.last_seen)}`}
                  </p>
                )}
                {activeChat.type === 'group' && (
                  <p className="text-xs text-gray-500">{activeChat.memberCount || 0} members</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
              {loadingMore && <div className="text-center text-gray-400 text-sm">Loading older messages...</div>}
              {messages.map(msg => (
                <div
                  key={msg.id || Math.random()}
                  className={`flex ${msg.sender_id === loggedInUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender_id === loggedInUserId
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.sender_id !== loggedInUserId && (
                      <p className="font-medium text-sm mb-1">{msg.sender_name || msg.user}</p>
                    )}
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex items-center">
                <button type="button" className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-2">
                  <Image className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className={`ml-2 p-2 rounded-full ${
                    message.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
