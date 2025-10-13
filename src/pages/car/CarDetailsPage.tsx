import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';
import Modal from '../../components/common/UI/Modal';
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
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setCar(data);
      } catch (err: any) {
        setError(`Failed to load car details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCarDetails();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingDates.startDate || !bookingDates.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const start = new Date(bookingDates.startDate);
      const end = new Date(bookingDates.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = days * (car?.price_per_day || 0);

      const { error } = await supabase.from('bookings').insert({
        car_id: id,
        user_id: user.id,
        start_date: bookingDates.startDate,
        end_date: bookingDates.endDate,
        total_price: totalPrice,
        status: 'pending'
      });

      if (error) throw error;

      alert('Booking request submitted successfully!');
      setShowBookingModal(false);
      navigate('/bookings');
    } catch (err: any) {
      alert(`Failed to create booking: ${err.message}`);
    }
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
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

  const validImages = car.images?.length > 0 ? car.images : ['https://via.placeholder.com/800x600/e5e7eb/6b7280?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/cars" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative group">
                <img
                  src={validImages[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=No+Image';
                  }}
                />

                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? validImages.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === validImages.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    car.is_available
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50 backdrop-blur-sm'
                      : 'bg-red-500/20 text-red-400 border border-red-500/50 backdrop-blur-sm'
                  }`}>
                    {car.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {validImages.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500/50 transition-colors">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white font-semibold">{car.year}</p>
                  <p className="text-xs text-gray-400">Year</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500/50 transition-colors">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-white font-semibold">{car.seats}</p>
                  <p className="text-xs text-gray-400">Seats</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500/50 transition-colors">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-white font-semibold">{car.fuel_type}</p>
                  <p className="text-xs text-gray-400">Fuel Type</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500/50 transition-colors">
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
                  <div className="grid grid-cols-2 gap-2">
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

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl sticky top-24">
              <div className="mb-6">
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

              <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Price per day</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${car.price_per_day}
                </p>
              </div>

              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-semibold">
                  {car.category}
                </span>
              </div>

              {car.is_available ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowBookingModal(true)}
                  disabled={!user}
                >
                  {user ? 'Book Now' : 'Login to Book'}
                </Button>
              ) : (
                <Button variant="secondary" size="lg" fullWidth disabled>
                  Currently Unavailable
                </Button>
              )}

              {!user && (
                <p className="text-sm text-gray-400 text-center mt-4">
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

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Your Car"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Start Date"
            type="date"
            value={bookingDates.startDate}
            onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="End Date"
            type="date"
            value={bookingDates.endDate}
            onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
            fullWidth
            required
          />
          
          {bookingDates.startDate && bookingDates.endDate && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Estimated Total</p>
              <p className="text-2xl font-bold text-white">
                ${Math.ceil((new Date(bookingDates.endDate).getTime() - new Date(bookingDates.startDate).getTime()) / (1000 * 60 * 60 * 24)) * car.price_per_day}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowBookingModal(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBooking} fullWidth>
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CarDetailsPage;
