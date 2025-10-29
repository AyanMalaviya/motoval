import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';
// import type { Car } from '../../types/car';

interface UserCar {
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
  created_at: string;
  updated_at: string;
}

// const transformUserCar = (userCar: UserCar): Car => ({
//   id: userCar.id,
//   make: userCar.make,
//   model: userCar.model,
//   year: userCar.year,
//   pricePerDay: userCar.price_per_day,
//   category: userCar.category,
//   isAvailable: userCar.is_available,
//   features: userCar.features || [],
//   imageUrl: userCar.images[0] || 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image',
//   images: userCar.images,
//   seats: userCar.seats,
//   fuelType: userCar.fuel_type,
//   transmission: userCar.transmission,
//   description: userCar.description
// });

const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const [userCars, setUserCars] = useState<UserCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCars = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setUserCars(data || []);
      } catch (err: any) {
        setError(`Failed to load your listings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCars();
  }, [user]);

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('user_cars')
        .delete()
        .eq('id', carId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserCars(prev => prev.filter(car => car.id !== carId));
    } catch (err: any) {
      alert(`Failed to delete listing: ${err.message}`);
    }
  };

  const toggleAvailability = async (carId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_cars')
        .update({ is_available: !currentStatus })
        .eq('id', carId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserCars(prev => 
        prev.map(car => 
          car.id === carId ? { ...car, is_available: !currentStatus } : car
        )
      );
    } catch (err: any) {
      alert(`Failed to update availability: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-4">Login Reqcommon/UIred</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your listings</p>
          <Link to="/login">
            <Button variant="primary" size="lg" fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Loading fullScreen text="Loading your listings..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              My Car Listings
            </h1>
            <p className="text-gray-400">Manage your rental car listings</p>
          </div>
          <Link to="/add-car">
            <Button variant="primary" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Car
            </Button>
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-bold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-white">{userCars.length}</p>
                <p className="text-gray-400">Total Listings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-white">
                  {userCars.filter(car => car.is_available).length}
                </p>
                <p className="text-gray-400">Available</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-red-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold text-white">
                  {userCars.filter(car => !car.is_available).length}
                </p>
                <p className="text-gray-400">Unavailable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Car Listings */}
        {userCars.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-6">Start earning by listing your first car!</p>
            <Link to="/add-car">
              <Button variant="primary" size="lg">
                List Your First Car
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userCars.map((car) => {
              if (!car) return null;
              
              return (
                <div key={car.id} className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                  <div className="md:flex">
                    {/* Car Image */}
                    <div className="md:w-1/3 relative group overflow-hidden">
                      <img
                        src={car.images?.[0] || 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image'}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-48 md:h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                    </div>
                    
                    {/* Car Details */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {car.make} {car.model} ({car.year})
                          </h3>
                          <p className="text-gray-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {car.location}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Listed: {new Date(car.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ${car.price_per_day}
                          </p>
                          <p className="text-sm text-gray-500">per day</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="font-semibold text-purple-400">{car.category}</p>
                          <p className="text-xs text-gray-500">Category</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="font-semibold text-white">{car.seats}</p>
                          <p className="text-xs text-gray-500">Seats</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <p className="font-semibold text-white">{car.fuel_type}</p>
                          <p className="text-xs text-gray-500">Fuel</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                          <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            car.is_available 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/50'
                          }`}>
                            {car.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      {car.description && (
                        <p className="text-gray-400 mb-4 line-clamp-2">{car.description}</p>
                      )}

                      {car.features && car.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-400 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {car.features.slice(0, 5).map((feature, index) => (
                              <span key={index} className="bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg text-xs">
                                {feature}
                              </span>
                            ))}
                            {car.features.length > 5 && (
                              <span className="bg-gray-800 border border-gray-700 text-purple-400 px-2.5 py-1 rounded-lg text-xs">
                                +{car.features.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant={car.is_available ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleAvailability(car.id, car.is_available)}
                        >
                          {car.is_available ? 'Mark Unavailable' : 'Mark Available'}
                        </Button>
                        
                        <Link to={`/edit-listing/${car.id}`}>
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                        </Link>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;
