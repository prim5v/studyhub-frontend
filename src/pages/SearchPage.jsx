import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { BookOpen, Layers } from "lucide-react";

const API_BASE_URL = "https://studyhub-8req.onrender.com";

export const SearchPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({ users: [], resources: [], groups: [] });
  const [loading, setLoading] = useState(false);

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const endpoint =
          activeTab === "all"
            ? `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
            : `${API_BASE_URL}/api/search/${activeTab}?q=${encodeURIComponent(query)}`;

        const res = await fetch(endpoint);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }

        const data = await res.json();
        console.log("Search results:", data);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query, activeTab]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-6">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {["all", "users", "resources", "groups"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Searching...</p>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Users */}
          {(activeTab === "all" || activeTab === "users") &&
            results.users.map((user) => (
              <Link
                key={user.user_id}
                to={`/profile/${user.user_id}`}
                className="p-4 border rounded-lg shadow hover:shadow-md transition block w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_pic || "/default-avatar.png"}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold">{user.name || user.email}</h2>
                    <p className="text-sm text-gray-500">{user.course_name}</p>
                  </div>
                </div>
              </Link>
            ))}

          {/* Resources */}
          {(activeTab === "all" || activeTab === "resources") &&
            results.resources.map((res) => (
              <Link
                key={res.resource_id}
                to={`/resource/${res.resource_id}`}
                className="p-4 border rounded-lg shadow hover:shadow-md transition block w-full text-left"
              >
                <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
                <h2 className="font-semibold">{res.resource_name}</h2>
                <p className="text-sm text-gray-500">{res.course_name}</p>
              </Link>
            ))}

          {/* Groups */}
          {(activeTab === "all" || activeTab === "groups") &&
            results.groups.map((grp) => (
              <Link
                key={grp.group_id}
                to={`/groups/${grp.group_id}`}
                state={{
                  group: {
                    id: grp.group_id,
                    name: grp.group_name,
                    course: grp.course,
                    owner_id: grp.owner_id,
                  },
                }}
                className="p-4 border rounded-lg shadow hover:shadow-md transition block w-full text-left"
              >
                <Layers className="h-6 w-6 text-purple-500 mb-2" />
                <h2 className="font-semibold">{grp.group_name}</h2>
                <p className="text-sm text-gray-500">{grp.course}</p>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};
