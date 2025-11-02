import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/Motoval_logo.png'

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="MotoVal Logo"
              className="w-12 h-12 rounded-xl object-contain transform group-hover:rotate-6 transition-all duration-300"
            />
            <span className="hidden sm:block text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MotoVal
            </span>
          </Link>

          {/* Navigation */}
          <Navigation />

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
