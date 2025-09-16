import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

// Connect socket
const socket = io("https://studyhub-8req.onrender.com"); // change to your backend URL
// http://192.168.4.107:5000
export const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onShowIntro }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    socket.emit("login", formData);

    socket.once("login_response", (response) => {
      setLoading(false);

      if (response.status === "success") {
        alert(`Login successful ✅ Welcome ${response.user.name}`);

        localStorage.setItem("user", JSON.stringify(response.user));
        onClose();

        const introPlayed = localStorage.getItem("introPlayed");
        console.log("introPlayed in localStorage:", introPlayed);

        if (!introPlayed && onShowIntro) {
          console.log("Triggering intro modal via parent");
          onShowIntro(); // show IntroModal after first login
        }

        navigate("/home/");
      } else {
        alert("Error: " + response.message);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Login to StudyHub</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 mr-2" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary-600 hover:text-primary-800">Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="p-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="text-primary-600 hover:text-primary-800 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
