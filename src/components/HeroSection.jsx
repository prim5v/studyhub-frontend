import React from 'react';
import { Button } from './Button';
import { BookOpenIcon, GraduationCapIcon, UsersIcon, ClockIcon } from 'lucide-react';
export const HeroSection = ({
  onSignupClick
}) => {
  return <section className="relative min-h-screen w-full flex flex-col justify-center items-center text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Students studying with books" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-secondary-900/80"></div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 py-20 z-10 text-center">
        <div className="animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Elevate Your <span className="text-primary-300">Learning</span>{' '}
            Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
            Join the community of ambitious students who are transforming their
            academic experience with StudyHub.
          </p>
          <Button variant="primary" size="lg" onClick={onSignupClick} className="animate-float shadow-lg shadow-primary-500/30">
            Get Started Today
          </Button>
        </div>
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
            <div className="rounded-full bg-primary-500 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <GraduationCapIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-200">
              Access to top tutors and comprehensive study materials for all
              courses.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
            <div className="rounded-full bg-secondary-500 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Collaborative Learning
            </h3>
            <p className="text-gray-200">
              Connect with peers and form study groups to enhance understanding.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
            <div className="rounded-full bg-primary-500 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Time Management</h3>
            <p className="text-gray-200">
              Tools and techniques to optimize your study schedule and boost
              productivity.
            </p>
          </div>
          
        </div>
      </div>
    </section>;
};