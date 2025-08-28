import React, { useState, useEffect } from 'react'
import CarCard from '../../components/car/CarCard'
import CarFiltersComponent from '../../components/car/CarFilters'
import { supabase } from '../../services/supabaseClient'
import type { Car, CarFilters } from '../../types/car'

// Database interface matching your Supabase table
interface UserCar {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  price_per_day: number
  category: string
  description: string
  seats: number
  fuel_type: string
  transmission: string
  features: string[]
  is_available: boolean
  location: string
  images: string[]
  created_at: string
  updated_at: string
}

// Transform UserCar to Car interface for display
const transformUserCar = (userCar: UserCar): Car => ({
  id: userCar.id,
  make: userCar.make,
  model: userCar.model,
  year: userCar.year,
  pricePerDay: userCar.price_per_day,
  category: userCar.category,
  isAvailable: userCar.is_available,
  features: userCar.features || [],
  imageUrl: userCar.images && userCar.images.length > 0 
    ? userCar.images[0] 
    : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  seats: userCar.seats,
  fuelType: userCar.fuel_type,
  transmission: userCar.transmission,
  description: userCar.description
})

const CarListingPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [filters, setFilters] = useState<CarFilters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalCarsCount, setTotalCarsCount] = useState(0)

  // Fetch cars from database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching cars from database...')
        
        // Fetch all available cars
        const { data: userCars, error: fetchError, count } = await supabase
          .from('user_cars')
          .select('*', { count: 'exact' })
          .eq('is_available', true)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('❌ Supabase fetch error:', fetchError)
          throw fetchError
        }

        console.log('📊 Raw database response:', userCars)
        console.log('📈 Total count:', count)
        
        setTotalCarsCount(count || 0)

        if (userCars && userCars.length > 0) {
          const transformedCars = userCars.map((car: UserCar) => transformUserCar(car))
          console.log('✨ Transformed cars:', transformedCars)
          setCars(transformedCars)
          console.log(`✅ Successfully loaded ${transformedCars.length} cars from database`)
        } else {
          console.log('⚠️ No cars found in database')
          setCars([])
        }
        
      } catch (err: any) {
        console.error('❌ Error loading cars:', err)
        setError(`Failed to load cars: ${err.message}`)
        
        // Fallback to demo data for testing
        const fallbackCars: Car[] = [
          {
            id: 'demo-1',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            pricePerDay: 45,
            category: 'Sedan',
            isAvailable: true,
            features: ['AC', 'Bluetooth', 'GPS'],
            imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            seats: 5,
            fuelType: 'Gasoline',
            transmission: 'Automatic',
            description: 'Demo car - Database connection failed'
          }
        ]
        setCars(fallbackCars)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  // Filter cars based on search and filters
  useEffect(() => {
    let filtered = cars.filter(car => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Make filter
      const matchesMake = !filters.make || car.make === filters.make
      
      // Category filter
      const matchesCategory = !filters.category || car.category === filters.category
      
      // Price filter
      const matchesPrice = (!filters.maxPrice || car.pricePerDay <= filters.maxPrice) &&
                           (!filters.minPrice || car.pricePerDay >= filters.minPrice)
      
      // Availability filter
      const matchesAvailability = filters.isAvailable === undefined || car.isAvailable === filters.isAvailable

      return matchesSearch && matchesMake && matchesCategory && matchesPrice && matchesAvailability
    })

    setFilteredCars(filtered)
    console.log(`🔍 Filtered ${filtered.length} cars from ${cars.length} total`)
  }, [cars, filters, searchTerm])

  // Debug function to test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('🧪 Testing database connection...')
      const { data, error } = await supabase
        .from('user_cars')
        .select('count(*)')
        .limit(1)

      if (error) {
        console.error('❌ Database test failed:', error)
      } else {
        console.log('✅ Database connection successful:', data)
      }
    } catch (err) {
      console.error('❌ Database test error:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rental cars...</p>
          <button 
            onClick={testDatabaseConnection}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Test Database Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Community Car Rentals
          </h1>
          <p className="text-gray-600 mb-4">
            Rent directly from car owners in your area
          </p>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">Database Error:</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-xs mt-2">Check browser console for details</p>
                </div>
                <button 
                  onClick={testDatabaseConnection}
                  className="text-sm bg-red-200 px-2 py-1 rounded"
                >
                  Test DB
                </button>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by make, model, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CarFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Showing {filteredCars.length} of {cars.length} available cars
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500">
                Searching for: "{searchTerm}"
              </p>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex space-x-4 text-sm text-gray-500">
            <span>Total: {totalCarsCount}</span>
            <span>Available: {cars.filter(car => car.isAvailable).length}</span>
            <span>Price Range: ${Math.min(...cars.map(car => car.pricePerDay))} - ${Math.max(...cars.map(car => car.pricePerDay))}</span>
          </div>
        </div>

        {/* Car Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {cars.length === 0 ? 'No cars available yet' : 'No cars match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {cars.length === 0 
                ? 'Be the first to list your car for rent!' 
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            
            {cars.length === 0 && (
              <div className="space-x-4">
                <button 
                  onClick={() => window.location.href = '/add-car'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  List Your Car
                </button>
                <button 
                  onClick={testDatabaseConnection}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Check Database
                </button>
              </div>
            )}
            
            {cars.length > 0 && (
              <button
                onClick={() => {
                  setFilters({})
                  setSearchTerm('')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
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
  )
}

export default CarListingPage
