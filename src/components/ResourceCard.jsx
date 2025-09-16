import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Video, Music, ThumbsUp, MessageSquare, Bookmark, Download, Eye } from 'lucide-react';

export const ResourceCard = ({
  id,
  title,
  type,
  subject,
  uploadedBy,
  date,
  likes,
  comments,
  isFavorite,
  hasLiked,   // 👈 from backend
  onLike,
  onFavorite,
  resourceUrl   // 👈 Cloudinary file link
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'mp3':
        return <Music className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/resource/${id}`)} // ✅ navigate on card click
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-3">
          {getIcon()}
          <span className="ml-2 text-xs font-medium text-gray-500 uppercase">{type}</span>
          <span className="ml-auto text-xs text-gray-500">{date}</span>
        </div>

        {/* Title & Subject */}
        <h3 className="font-medium text-lg text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">{subject}</span> • Uploaded by{' '}
          <Link
            to={`/profile/${uploadedBy.id}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()} // Prevent card navigation
          >
            {uploadedBy.name}
          </Link>
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-4">
            {/* ❤️ Like Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className={`flex items-center text-xs ${
                hasLiked ? 'text-red-500' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-red-500' : ''}`} />
              {likes}
            </button>

            {/* 💬 Comments */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-gray-600 hover:text-blue-600 text-xs"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {comments}
            </button>
          </div>

          <div className="flex space-x-2">
            {/* ⭐ Favorite Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`p-2 rounded-full ${isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Bookmark className="h-4 w-4" />
            </button>

            {/* 👀 View Resource */}
            {resourceUrl && (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4" />
              </a>
            )}

            {/* ⬇️ Download Resource */}
            {resourceUrl && (
              <a
                href={resourceUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
