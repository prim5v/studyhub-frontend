import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, User, Menu } from "lucide-react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = loggedInUser?.user_id;

  // Navigate to search page on Enter key press
  const handleSearch = (e) => {
    e.preventDefault(); // prevent default form submission
    if (searchTerm.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                StudyHub
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 mx-8">
            <form className="relative w-full" onSubmit={handleSearch}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes, groups, students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <Link
              to="/public-chat"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="h-6 w-6" />
            </Link>
            <Link
              to={loggedInUserId ? `/profile/${loggedInUserId}` : "/profile/me"}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 p-4">
          <form className="relative mb-4" onSubmit={handleSearch}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes, groups, students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <div className="flex justify-around">
            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <Link
              to="/messages"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="h-6 w-6" />
            </Link>
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
      )}
    </nav>
  );
};
