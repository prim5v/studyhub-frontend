import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { io } from "socket.io-client";

// Connect socket
const socket = io("https://studyhub-8req.onrender.com"); // 🔹 update to your backend URL if deployed

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    instagram: '',
    phone: '',
    course_name: '',
    about: '',
    description: '',
    gender: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    socket.emit("signup", formData);

    // inside handleSubmit signup response
socket.once("signup_response", (response) => {
  setLoading(false);
  if (response.status === "success") {
    alert("Signup successful ✅");

    // Save minimal user info (you can fetch full later)
    localStorage.setItem("user", JSON.stringify({
      user_id: response.user_id,
      email: formData.email,
      name: formData.name
    }));

    onSwitchToLogin(); // switch to login modal
  } else {
    alert("Error: " + response.message);
  }
});

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 animate-slide-up overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Create Your StudyHub Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            <Input label="Instagram Handle" name="instagram" placeholder="@yourusername" value={formData.instagram} onChange={handleChange} />
            <Input label="Phone Number" name="phone" placeholder="+1 (123) 456-7890" value={formData.phone} onChange={handleChange} />
            <Input label="Course Name" name="course_name" placeholder="Computer Science" value={formData.course_name} onChange={handleChange} required />
            <div className="md:col-span-2">
              <Input label="About" name="about" placeholder="A brief introduction about yourself" value={formData.about} onChange={handleChange} textarea />
            </div>
            <div className="md:col-span-2">
              <Input label="Description" name="description" placeholder="More details about your academic interests and goals" value={formData.description} onChange={handleChange} textarea />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <Input label="Year of Study" name="year" placeholder="e.g., 2nd Year" value={formData.year} onChange={handleChange} />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>
        <div className="p-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-primary-600 hover:text-primary-800 font-medium">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
