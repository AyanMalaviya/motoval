import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Input from '../../components/common/UI/Input';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  date_of_birth: string;
  driver_license_number: string;
  driver_license_expiry: string;
  avatar_url: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    driver_license_number: '',
    driver_license_expiry: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            bio: data.bio || '',
            date_of_birth: data.date_of_birth || '',
            driver_license_number: data.driver_license_number || '',
            driver_license_expiry: data.driver_license_expiry || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Clear previous messages
    setMessage('');

    // Validate phone number is provided
    if (!formData.phone || formData.phone.trim() === '') {
      setMessage('Phone number is required for booking purposes');
      setMessageType('error');
      return;
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage('Phone number must be exactly 10 digits');
      setMessageType('error');
      return;
    }

    setSaving(true);

    try {
      // Clean the data - convert empty strings to null for date fields
      const cleanedData = {
        id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        bio: formData.bio,
        date_of_birth: formData.date_of_birth?.trim() || null,
        driver_license_number: formData.driver_license_number,
        driver_license_expiry: formData.driver_license_expiry?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .upsert(cleanedData);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 5000);
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...formData } : null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading your profile..." size="lg" />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 border-b border-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
              <span className="text-3xl font-bold text-white">
                {formData.first_name ? formData.first_name.charAt(0) : user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-400">Manage your account information and preferences</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Phone Number Warning Alert */}
          {!profile?.phone && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Phone Number Required</p>
                <p className="text-sm">Please add your phone number to enable car bookings and allow owners to contact you for negotiations.</p>
              </div>
            </div>
          )}

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg flex items-start gap-3 ${
              messageType === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}>
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                {messageType === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Current Profile Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Current Profile Information</h2>
            </div>
            
            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Full Name</p>
                  <p className="text-white font-medium">
                    {profile.first_name} {profile.last_name || 'Not provided'}
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                
                <div className={`bg-gray-800 rounded-lg p-4 border ${profile.phone ? 'border-gray-700' : 'border-yellow-500/50'}`}>
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <p className={`font-medium ${profile.phone ? 'text-white' : 'text-yellow-400'}`}>
                    {profile.phone || '⚠️ Required for bookings'}
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Driver's License</p>
                  <p className="text-white font-medium">{profile.driver_license_number || 'Not provided'}</p>
                </div>
                
                <div className="md:col-span-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Bio</p>
                  <p className="text-white">{profile.bio || 'No bio added yet'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Profile information not loaded</p>
            )}
          </div>

          {/* Update Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Update Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                    fullWidth
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                    fullWidth
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                      fullWidth
                    />
                  </div>
                  <Input
                    label="Phone Number *"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    helperText="Required - 10 digits only"
                    required
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    }
                    fullWidth
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 resize-none"
                    />
                  </div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
              </div>

              {/* Driver's License */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Driver's License
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="License Number"
                    type="text"
                    name="driver_license_number"
                    value={formData.driver_license_number}
                    onChange={handleInputChange}
                    placeholder="DL123456789"
                    fullWidth
                  />
                  <Input
                    label="License Expiry Date"
                    type="date"
                    name="driver_license_expiry"
                    value={formData.driver_license_expiry}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-800">
                <Button
                  type="submit"
                  variant="primary"
                  size={"lg" as const}
                  isLoading={saving}
                  fullWidth
                >
                  {saving ? 'Updating Profile...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfilePage;
