import React, { useState, useEffect } from 'react';
import CarCard from '../../components/car/CarCard';
import CarFiltersComponent from '../../components/car/CarFilters';
import type { Car, CarFilters } from '../../types/car';

const CarListingPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<CarFilters>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCars: Car[] = [
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            pricePerDay: 45,
            category: 'Sedan',
            isAvailable: true,
            features: ['AC', 'Bluetooth', 'GPS'],
            imageUrl: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Toyota+Camry',
            seats: 5,
            fuelType: 'Gasoline',
            transmission: 'Automatic'
          },
          {
            id: '2',
            make: 'Ford',
            model: 'Mustang',
            year: 2024,
            pricePerDay: 85,
            category: 'Sports',
            isAvailable: true,
            features: ['AC', 'Bluetooth', 'Premium Sound'],
            imageUrl: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Ford+Mustang',
            seats: 4,
            fuelType: 'Gasoline',
            transmission: 'Manual'
          },
          {
            id: '3',
            make: 'Tesla',
            model: 'Model 3',
            year: 2024,
            pricePerDay: 120,
            category: 'Electric',
            isAvailable: true,
            features: ['Autopilot', 'Premium Interior', 'Supercharging'],
            imageUrl: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Tesla+Model+3',
            seats: 5,
            fuelType: 'Electric',
            transmission: 'Automatic'
          },
          {
            id: '4',
            make: 'BMW',
            model: 'X5',
            year: 2023,
            pricePerDay: 95,
            category: 'SUV',
            isAvailable: false,
            features: ['4WD', 'Premium Sound', 'Leather Seats'],
            imageUrl: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=BMW+X5',
            seats: 7,
            fuelType: 'Gasoline',
            transmission: 'Automatic'
          },
          {
            id: '5',
            make: 'Audi',
            model: 'A4',
            year: 2023,
            pricePerDay: 75,
            category: 'Luxury',
            isAvailable: true,
            features: ['Quattro AWD', 'Virtual Cockpit', 'Premium Plus'],
            imageUrl: 'https://via.placeholder.com/400x200/f59e0b/ffffff?text=Audi+A4',
            seats: 5,
            fuelType: 'Gasoline',
            transmission: 'Automatic'
          },
          {
            id: '6',
            make: 'Honda',
            model: 'Civic',
            year: 2023,
            pricePerDay: 40,
            category: 'Hatchback',
            isAvailable: true,
            features: ['Honda Sensing', 'Apple CarPlay', 'Fuel Efficient'],
            imageUrl: 'https://via.placeholder.com/400x200/6b7280/ffffff?text=Honda+Civic',
            seats: 5,
            fuelType: 'Gasoline',
            transmission: 'CVT'
          }
        ];

        setCars(mockCars);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Filter cars based on filters and search term
  useEffect(() => {
    let filtered = cars.filter(car => {
      const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMake = !filters.make || car.make === filters.make;
      const matchesCategory = !filters.category || car.category === filters.category;
      const matchesPrice = !filters.maxPrice || car.pricePerDay <= filters.maxPrice;
      const matchesAvailability = filters.isAvailable === undefined || car.isAvailable === filters.isAvailable;

      return matchesSearch && matchesMake && matchesCategory && matchesPrice && matchesAvailability;
    });

    setFilteredCars(filtered);
  }, [cars, filters, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Cars for Rent</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search cars by make or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <CarFiltersComponent filters={filters} onFiltersChange={setFilters} />

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCars.length} of {cars.length} cars
          </p>
        </div>

        {/* Car Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cars found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarListingPage;
