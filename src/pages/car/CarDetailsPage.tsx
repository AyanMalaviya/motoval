import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { otpService } from '../../services/otpService';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';
import Input from '../../components/common/UI/Input';

interface CarDetail {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  price_per_day: number;
  category: string;
  description: string;
  seats: number;
  fuel_type: string;
  transmission: string;
  features: string[];
  is_available: boolean;
  location: string;
  images: string[];
}

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch car details
        const { data: carData, error: fetchError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Fetch owner phone separately
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('phone')
          .eq('id', carData.user_id)
          .single();

        if (!ownerError && ownerData) {
          setOwnerPhone(ownerData.phone || '');
        }

        setCar(carData);
      } catch (err: any) {
        setError(`Failed to load car details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCarDetails();
  }, [id]);

  const handleBookNowClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('phone, phone_verified, driver_license_number, driver_license_expiry')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.phone) {
        alert('Please add your phone number in your profile before booking.');
        navigate('/profile');
        return;
      }

      setUserPhone(profile.phone);

      if (!profile.driver_license_number || !profile.driver_license_expiry) {
        alert('Please add your driver license details in your profile before booking.');
        navigate('/profile');
        return;
      }

      if (new Date(profile.driver_license_expiry) < new Date()) {
        alert('Your driver license has expired. Please update it in your profile.');
        navigate('/profile');
        return;
      }

      if (!profile.phone_verified) {
        setShowOTPModal(true);
        return;
      }

      setShowBookingModal(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSendOTP = async () => {
    const result = await otpService.sendOTP(userPhone);
    if (result.success) {
      setOtpSent(true);
    } else {
      alert(`Failed to send OTP: ${result.error}`);
    }
  };

  const handleVerifyOTP = async () => {
    const result = await otpService.verifyOTP(otp);
    if (result.success) {
      alert('Phone verified successfully!');
      setShowOTPModal(false);
      setShowBookingModal(true);
    } else {
      alert(`Verification failed: ${result.error}`);
    }
  };

  const handleBooking = async () => {
    if (!bookingDates.startDate || !bookingDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (!id || !car) {
      alert('Car information not available');
      return;
    }

    try {
      setBookingLoading(true);

      const result = await bookingService.createBooking(
        id,
        bookingDates.startDate,
        bookingDates.endDate,
        bookingDates.message
      );

      if (result.success) {
        alert('Booking request submitted successfully!');
        setShowBookingModal(false);
        navigate('/bookings');
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (err: any) {
      alert(`Failed to create booking: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!bookingDates.startDate || !bookingDates.endDate || !car) return 0;
    
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days * car.price_per_day : 0;
  };

  const openWhatsApp = () => {
    if (!ownerPhone) {
      alert('Owner phone number not available');
      return;
    }
    const message = `Hi! I'm interested in booking your ${car?.make} ${car?.model} (${car?.year})`;
    const whatsappUrl = `https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Loading fullScreen text="Loading car details..." size="lg" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-4">Car Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The car you are looking for does not exist.'}</p>
          <Link to="/cars">
            <Button variant="primary" size="lg" fullWidth>
              Back to Listings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const validImages = car.images?.length > 0 ? car.images : ['https://via.placeholder.com/800x600/1f2937/9ca3af?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/cars" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="relative aspect-video">
                <img
                  src={validImages[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600/1f2937/9ca3af?text=No+Image';
                  }}
                />
                
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                    car.is_available
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {car.is_available ? 'Available' : 'Currently Booked'}
                  </span>
                </div>

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? validImages.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-purple-600 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === validImages.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-purple-600 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {validImages.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white font-semibold">{car.year}</p>
                  <p className="text-xs text-gray-400">Year</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-white font-semibold">{car.seats}</p>
                  <p className="text-xs text-gray-400">Seats</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-white font-semibold">{car.fuel_type}</p>
                  <p className="text-xs text-gray-400">Fuel</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-white font-semibold">{car.transmission}</p>
                  <p className="text-xs text-gray-400">Transmission</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-400 leading-relaxed">{car.description || 'No description available.'}</p>
              </div>

              {car.features && car.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl sticky top-24 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {car.make} {car.model}
                </h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {car.location}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Price per day</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${car.price_per_day}
                </p>
              </div>

              <div>
                <span className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-semibold">
                  {car.category}
                </span>
              </div>

              {car.is_available ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBookNowClick}
                  disabled={!user}
                >
                  {user ? 'Book Now' : 'Login to Book'}
                </Button>
              ) : (
                <Button variant="secondary" size="lg" fullWidth disabled>
                  Currently Booked
                </Button>
              )}

              {/* WhatsApp Contact Button */}
              {ownerPhone && (
                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contact on WhatsApp
                </button>
              )}

              {!user && (
                <p className="text-sm text-gray-400 text-center">
                  <Link to="/login" className="text-purple-400 hover:text-purple-300">
                    Sign in
                  </Link>{' '}
                  to book this car
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Verify Phone Number</h3>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                We need to verify your phone number ({userPhone}) before you can make a booking.
              </p>

              {!otpSent ? (
                <Button
                  variant="primary"
                  onClick={handleSendOTP}
                  fullWidth
                >
                  Send OTP
                </Button>
              ) : (
                <>
                  <Input
                    label="Enter OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    fullWidth
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowOTPModal(false);
                        setOtpSent(false);
                        setOtp('');
                      }}
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleVerifyOTP}
                      fullWidth
                    >
                      Verify OTP
                    </Button>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    className="text-sm text-purple-400 hover:text-purple-300 w-full text-center"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Book Your Car</h3>
            
            <div className="space-y-4">
              <Input
                label="Start Date"
                type="date"
                value={bookingDates.startDate}
                onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                fullWidth
                required
                min={new Date().toISOString().split('T')[0]}
              />
              
              <Input
                label="End Date"
                type="date"
                value={bookingDates.endDate}
                onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                fullWidth
                required
                min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={bookingDates.message}
                  onChange={(e) => setBookingDates({ ...bookingDates, message: e.target.value })}
                  placeholder="Any special requests or questions..."
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 resize-none"
                  rows={3}
                />
              </div>
              
              {bookingDates.startDate && bookingDates.endDate && calculateTotalPrice() > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Estimated Total</p>
                  <p className="text-3xl font-bold text-white">
                    ${calculateTotalPrice().toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {Math.ceil((new Date(bookingDates.endDate).getTime() - new Date(bookingDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} days × ${car.price_per_day}/day
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowBookingModal(false)} 
                  fullWidth
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleBooking} 
                  fullWidth
                  isLoading={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetailsPage;
