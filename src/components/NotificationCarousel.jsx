import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

const socket = io("https://studyhub-8req.onrender.com");

export default function NotificationCarousel() {
  const fallbackMessage = "🚀 Welcome to our site! Stay tuned for live updates.Don’t forget to check new resources 🚀.System update scheduled for tonight ⚡.✨ Join study groups today and boost your academic journey. 💡 Share resources, notes, and ideas with fellow students. 🔔 Stay updated with real-time study group notifications. 🌍 Discover trending resources across all your courses. 🤝 Follow students, make friends, and study collaboratively. 📝 Create or join study groups for better learning outcomes. 🚀 Study Hub is your smart companion for academic success. 📖 Access shared notes, resources, and tutorials instantly. 🎯 Learn smarter, not harder — join Study Hub today! ";
  const [queue, setQueue] = useState([]); // backend notifications
  const [current, setCurrent] = useState(fallbackMessage);

  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    socket.on("notification", (notif) => {
      if (notif?.message) {
        setQueue((prev) => [...prev, notif.message]);
      }
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  // Watch queue → process messages
  useEffect(() => {
    if (queue.length > 0) {
      const nextMessage = queue[0];
      setCurrent(nextMessage);
      setIsFallback(false);

      const timer = setTimeout(() => {
        setQueue((prev) => prev.slice(1)); // remove first
        setIsFallback(prev => queue.length <= 1); // go fallback if no more
        if (queue.length <= 1) {
          setCurrent(fallbackMessage);
        }
      }, 10000); // match scroll duration

      return () => clearTimeout(timer);
    }
  }, [queue]);

  return (
    <div className="w-full bg-blue-600 text-white overflow-hidden rounded-md h-10 flex items-center relative">
      <motion.div
        key={current} // retriggers animation
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: isFallback ? Infinity : 0,
        }}
        className="whitespace-nowrap text-md font-medium absolute w-full text-center"
      >
        {current}
      </motion.div>
    </div>
  );
}
