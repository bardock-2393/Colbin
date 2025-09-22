import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        email: profileData.email || ''
      });
    }
  }, [profileData]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfileData(response.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Name validation (optional but if provided, must be valid)
    if (formData.name && (formData.name.length < 2 || formData.name.length > 50)) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    } else if (formData.name && !/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Bio validation (optional but if provided, must not exceed limit)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await userAPI.updateProfile(formData);
      setProfileData(response.user);
      updateUser(response.user);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData?.name || '',
      bio: profileData?.bio || '',
      email: profileData?.email || ''
    });
    setIsEditing(false);
    setErrors({});
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-premium p-10 fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(profileData?.name || profileData?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {successMessage && (
            <div className="mb-6 alert alert-success">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 alert alert-error">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            </div>
          )}

          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50/50 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {profileData?.email}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {profileData?.name || 'Not provided'}
                  </p>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Bio
                  </label>
                  <p className="text-gray-900 text-lg leading-relaxed min-h-[100px]">
                    {profileData?.bio || 'No bio provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Member Since
                      </label>
                      <p className="text-white font-medium">
                        {new Date(profileData?.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Updated
                      </label>
                      <p className="text-white font-medium">
                        {new Date(profileData?.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-900 font-medium">Active</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    Your account is in good standing
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={6}
                  className={`form-input ${errors.bio ? 'error' : ''} resize-none`}
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChange={handleChange}
                />
                {errors.bio && (
                  <p className="mt-2 text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 btn-primary py-3 text-base font-semibold ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 btn-secondary py-3 text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
