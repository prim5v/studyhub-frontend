import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export const StudyGroupCard = ({
  id,
  name,
  subject,
  memberCount,
  activeNow = 0,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white">
            <Users className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500">{subject}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <span className="text-xs text-gray-600">{memberCount} members</span>
            {activeNow > 0 && (
              <>
                <span className="mx-2 text-gray-300">•</span>
                <span className="flex items-center text-xs text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  {activeNow} active now
                </span>
              </>
            )}
          </div>
          <Link
            to={`/groups/${id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
          >
            Join Group
          </Link>
        </div>
      </div>
    </div>
  );
};
