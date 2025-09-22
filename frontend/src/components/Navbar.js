import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">
                Colbin
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
