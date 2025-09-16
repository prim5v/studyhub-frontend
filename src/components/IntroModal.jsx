import React, { useEffect } from 'react';
import { Button } from './Button';

export const IntroModal = ({ isOpen, onClose }) => {

  useEffect(() => {
    console.log("IntroModal mounted, isOpen:", isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        console.log("Auto-closing intro modal after 10s");
        localStorage.setItem("introPlayed", "true"); // mark as played automatically
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const playIntro = () => {
    console.log("Play intro clicked");
    const audio = new Audio("/intro.mp3");
    audio.play()
      .then(() => console.log("Intro audio started"))
      .catch(err => console.log("Audio play blocked:", err));

    localStorage.setItem("introPlayed", "true");
    onClose();
  };

  const skipIntro = () => {
    console.log("Skip intro clicked");
    localStorage.setItem("introPlayed", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white/90 rounded-xl p-8 max-w-lg mx-4 text-center shadow-lg border-2 border-blue-500">
        <h2 className="text-2xl font-bold mb-4">Welcome to StudyHub!</h2>
        <p className="mb-6">Do you want to listen to the introductory speech?</p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={playIntro}>Yes</Button>
          <Button variant="secondary" onClick={skipIntro}>No</Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">This will automatically close in 10 seconds.</p>
      </div>
    </div>
  );
};
