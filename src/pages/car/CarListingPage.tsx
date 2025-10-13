import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import CarCard from '../../components/car/CarCard';
import CarFiltersComponent from '../../components/car/CarFilters';
import Pagination from '../../components/common/UI/Pagination';
import Loading from '../../components/common/UI/Loading';
import type { Car, CarFilters } from '../../types/car';

const CarListingPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 9;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('user_cars')
          .select('*')
          .eq('is_available', true);

        if (filters.make) {
          query = query.eq('make', filters.make);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.maxPrice) {
          query = query.lte('price_per_day', filters.maxPrice);
        }
        if (filters.isAvailable !== undefined) {
          query = query.eq('is_available', filters.isAvailable);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const transformedCars: Car[] = (data || []).map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          pricePerDay: car.price_per_day,
          category: car.category,
          isAvailable: car.is_available,
          features: car.features || [],
          imageUrl: car.images?.[0] || 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image',
          images: car.images,
          seats: car.seats,
          fuelType: car.fuel_type,
          transmission: car.transmission,
          description: car.description
        }));

        setCars(transformedCars);
      } catch (err: any) {
        setError(`Failed to load cars: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters]);

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(cars.length / carsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Loading fullScreen text="Loading available cars..." size="lg" variant="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 border-b border-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Browse Available Cars
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find the perfect vehicle for your next adventure
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{cars.length} Cars Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <CarFiltersComponent filters={filters} onFiltersChange={setFilters} />

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

        {/* Cars Grid */}
        {currentCars.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">No cars found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showFirstLast={true}
                  maxVisible={5}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CarListingPage;
