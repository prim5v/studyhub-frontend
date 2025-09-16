import React, { useState } from 'react';
import { Search, Paperclip, Image, Smile, Send } from 'lucide-react';

export const Messages = () => {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(1);

  const conversations = [
    {
      id: 1,
      name: 'Alex Johnson',
      lastMessage: 'Thanks for the notes!',
      time: '10',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Sarah Lee',
      lastMessage: 'When is the next study session?',
      time: 'Yesterday',
      unread: 1,
      online: true,
    },
    {
      id: 3,
      name: 'Michael Brown',
      lastMessage: "I'll share my lecture recordings tomorrow",
      time: 'Yesterday',
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: 'Emma Wilson',
      lastMessage: 'Did you understand the homework?',
      time: 'Mon',
      unread: 3,
      online: true,
    },
    {
      id: 5,
      name: 'James Smith',
      lastMessage: "Let's meet at the library",
      time: 'Sun',
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Alex Johnson',
      content: "Hey, did you take notes for today's lecture?",
      time: '10',
      isCurrentUser: false,
    },
    {
      id: 2,
      sender: 'You',
      content: "Yes, I did! I'll share them with you.",
      time: '10',
      isCurrentUser: true,
    },
    {
      id: 3,
      sender: 'You',
      content: 'I also recorded the lecture. Let me know if you want that too.',
      time: '10',
      isCurrentUser: true,
    },
    {
      id: 4,
      sender: 'Alex Johnson',
      content: 'That would be great! Thanks so much.',
      time: '10',
      isCurrentUser: false,
    },
    {
      id: 5,
      sender: 'Alex Johnson',
      content: "I was sick today and missed everything. You're a lifesaver!",
      time: '10',
      isCurrentUser: false,
    },
    {
      id: 6,
      sender: 'You',
      content: "No problem! I'll upload them to our study group too.",
      time: '10',
      isCurrentUser: true,
    },
    {
      id: 7,
      sender: 'Alex Johnson',
      content: 'Thanks for the notes!',
      time: '10',
      isCurrentUser: false,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, would send message to backend
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-120px)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveChat(conversation.id)}
              className={`flex items-center p-4 border-b border-gray-100 cursor-pointer ${
                activeChat === conversation.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread > 0 && (
                <div className="ml-2 bg-blue-600 text-white text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full">
                  {conversation.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">Alex Johnson</h3>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.isCurrentUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 text-right ${
                    msg.isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
            >
              <Image className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
      </div>
    </div>
  );
};
