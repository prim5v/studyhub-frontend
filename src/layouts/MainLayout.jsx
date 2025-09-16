import React from 'react';
import { Navbar } from '../components/Navbar';
import Sidebar from "../components/Sidebar";
import { ActivitySidebar } from '../components/ActivitySidebar';
import NotificationCarousel from '../components/NotificationCarousel';

export const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <NotificationCarousel/>
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
          {children}
        </main>
        <ActivitySidebar />
      </div>
    </div>
  );
};
