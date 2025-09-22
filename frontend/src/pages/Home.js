import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left fade-in-up">
                <h1 className="text-5xl tracking-tight font-extrabold sm:text-6xl md:text-7xl">
                  <span className="block text-gray-900 xl:inline">Welcome to</span>{' '}
                  <span className="block text-gradient xl:inline">Colbin</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 sm:mt-8 sm:text-xl sm:max-w-2xl sm:mx-auto md:mt-8 md:text-2xl lg:mx-0 leading-relaxed">
                  A premium user management platform built with cutting-edge technology. 
                  Experience secure authentication, elegant profile management, and a sophisticated interface.
                </p>
                
                {isAuthenticated ? (
                  <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                      to="/profile"
                      className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                    >
                      View Profile
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                      to="/register"
                      className="btn-primary text-lg px-8 py-4 inline-flex items-center"
                    >
                      Get Started
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      to="/login"
                      className="btn-outline text-lg px-8 py-4"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="mt-6">
                    <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-elegant">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">
                          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">
                        Welcome back, <span className="font-bold text-gray-900">{user?.name || user?.email?.split('@')[0]}</span>!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
        
        {/* Premium Background decoration */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-dark sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-white text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-3 text-glow">Secure & Modern</h3>
              <p className="text-gray-200 text-lg">Enterprise-grade authentication with JWT tokens</p>
            </div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Premium Features Section */}
      <div className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-4">Premium Features</h2>
            <p className="text-4xl leading-tight font-bold tracking-tight text-gray-900 sm:text-5xl">
              Everything you need for
              <span className="block text-gradient">modern user management</span>
            </p>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Built with the latest technologies and designed for the modern web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group">
              <div className="card-premium p-8 text-center hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Authentication</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security with BCrypt hashing and JWT tokens with automatic refresh.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="card-premium p-8 text-center hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Profile Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Complete user profile management with real-time updates and validation.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="card-premium p-8 text-center hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Modern Tech Stack</h3>
                <p className="text-gray-600 leading-relaxed">
                  Built with React, Node.js, Express, and SQLite for optimal performance.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="card-premium p-8 text-center hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Responsive Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Beautiful, responsive interface that works seamlessly across all devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
