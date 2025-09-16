import React from 'react';
import { BookOpenIcon } from 'lucide-react';
import { Button } from './Button';
export const Header = ({
  onLoginClick,
  onSignupClick
}) => {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpenIcon className="w-8 h-8 text-primary-600 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            StudyHub
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={onLoginClick}>
            Login
          </Button>
          <Button variant="primary" size="sm" onClick={onSignupClick}>
            Get Started
          </Button>
        </div>
      </div>
    </header>;
};