import React, { useState, useEffect } from "react";
import { FileText, Video, Mic, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

const socket = io("https://studyhub-8req.onrender.com");

export const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const groupId = location.state?.group_id || null;

  const [resourceType, setResourceType] = useState("documents");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);

  const getUserId = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      return storedUser?.user_id || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    socket.on("upload_response", (data) => {
      console.log("Received upload response:", data);
      setLoading(false);
      setProgress(0);
      if (data.success) {
        setMessage({ type: "success", text: "Upload successful!" });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setMessage({ type: "error", text: `Upload failed: ${data.error}` });
      }
    });
    return () => socket.off("upload_response");
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("File selected:", selectedFile);
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to upload resources.");
      return;
    }
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File is too large!");
      return;
    }

    console.log("Starting upload for file:", file.name);
    setLoading(true);
    setMessage(null);
    setProgress(0);

    try {
      // 1. Get Cloudinary signature from backend
      const sigRes = await fetch("https://studyhub-8req.onrender.com/get-signature");
      const { signature, timestamp, cloud_name, api_key, error } = await sigRes.json();
      if (error) throw new Error(error);

      // 2. Upload file directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadData.secure_url) throw new Error("Cloudinary upload failed");

      console.log("✅ Uploaded to Cloudinary:", uploadData.secure_url);

      // 3. Send metadata + URL to backend via socket
      socket.emit("upload_resource", {
        sender_id: userId,
        title,
        description,
        subject,
        course,
        resource_type: resourceType,
        resource_url: uploadData.secure_url,
        group_id: groupId,
        is_group: groupId ? 1 : 0,
      });

      // Fake progress bar while waiting for server confirm
      let fakeProgress = 0;
      const interval = setInterval(() => {
        fakeProgress += 10;
        if (fakeProgress >= 90) {
          clearInterval(interval);
        }
        setProgress(fakeProgress);
      }, 200);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setLoading(false);
      setMessage({ type: "error", text: `Upload failed: ${err.message}` });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <div className="w-3/4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="mt-2 text-gray-700">{progress}%</span>
          </div>
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {groupId ? "Upload Group Resource" : "Upload Resource"}
          </h1>

          {message && (
            <div
              className={`mb-4 px-4 py-2 rounded-lg text-center font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Resource Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">
                Resource Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setResourceType("documents")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    resourceType === "documents"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="font-medium">Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceType("mp4")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    resourceType === "mp4"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Video className="h-8 w-8 mb-2" />
                  <span className="font-medium">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResourceType("mp3")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                    resourceType === "mp3"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Mic className="h-8 w-8 mb-2" />
                  <span className="font-medium">Audio</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
              />
            </div>

            {/* Subject & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="computerScience">Computer Science</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="literature">Literature</option>
                  <option value="history">History</option>
                  <option value="economics">Economics</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Course (Optional)
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-gray-700"
                disabled={loading}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-2"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload Resource"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
