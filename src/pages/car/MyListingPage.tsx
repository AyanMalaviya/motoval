import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient' // ← Add this import
import { carDatabaseService, type UserCar } from '../../services/carDatabaseService'
import type { Car } from '../../types/car'

// Transform UserCar to Car interface for display
const transformUserCar = (userCar: UserCar): Car => ({
  id: userCar.id,
  make: userCar.make,
  model: userCar.model,
  year: userCar.year,
  pricePerDay: userCar.price_per_day,
  category: userCar.category,
  isAvailable: userCar.is_available,
  features: userCar.features,
  imageUrl: userCar.images[0] || 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image',
  seats: userCar.seats,
  fuelType: userCar.fuel_type,
  transmission: userCar.transmission,
  description: userCar.description
})

const MyListingsPage: React.FC = () => {
  const { user } = useAuth()
  const [userCars, setUserCars] = useState<UserCar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserCars = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching cars for user:', user.id)
        
        // Get user's cars from database
        const { data, error: fetchError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('❌ Database error:', fetchError)
          throw fetchError
        }

        console.log('📊 User cars data:', data)
        setUserCars(data || [])
        console.log(`✅ Loaded ${data?.length || 0} user cars`)
      } catch (err: any) {
        console.error('Error loading user cars:', err)
        setError(`Failed to load your listings: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCars()
  }, [user])

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      console.log('🗑️ Deleting car:', carId)
      const { error } = await supabase
        .from('user_cars')
        .delete()
        .eq('id', carId)
        .eq('user_id', user?.id) // Security check

      if (error) throw error

      setUserCars(prev => prev.filter(car => car.id !== carId))
      alert('Car listing deleted successfully!')
    } catch (err: any) {
      console.error('Error deleting car:', err)
      alert(`Failed to delete listing: ${err.message}`)
    }
  }

  const toggleAvailability = async (carId: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling availability for car:', carId)
      const { error } = await supabase
        .from('user_cars')
        .update({ is_available: !currentStatus })
        .eq('id', carId)
        .eq('user_id', user?.id)

      if (error) throw error

      setUserCars(prev => 
        prev.map(car => 
          car.id === carId ? { ...car, is_available: !currentStatus } : car
        )
      )
      console.log('✅ Availability toggled successfully')
    } catch (err: any) {
      console.error('Error updating availability:', err)
      alert(`Failed to update availability: ${err.message}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your listings</p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Car Listings</h1>
            <p className="text-gray-600">Manage your rental car listings</p>
          </div>
          <Link
            to="/add-car"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Car
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-2">Check the browser console for more details.</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{userCars.length}</p>
                <p className="text-gray-600">Total Listings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {userCars.filter(car => car.is_available).length}
                </p>
                <p className="text-gray-600">Available</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${userCars.reduce((sum, car) => sum + car.price_per_day, 0).toFixed(0)}
                </p>
                <p className="text-gray-600">Total Daily Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Car Listings */}
        {userCars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Start earning by listing your first car!</p>
            <Link
              to="/add-car"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              List Your First Car
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Car Image */}
                  <div className="md:w-1/3">
                    <img
                      src={car.images[0] || 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image'}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-48 md:h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=No+Image'
                      }}
                    />
                  </div>
                  
                  {/* Car Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {car.make} {car.model} ({car.year})
                        </h3>
                        <p className="text-gray-600">{car.location}</p>
                        <p className="text-sm text-gray-500">Listed: {new Date(car.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${car.price_per_day}</p>
                        <p className="text-sm text-gray-500">per day</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="font-semibold">{car.category}</p>
                        <p className="text-sm text-gray-600">Category</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{car.seats}</p>
                        <p className="text-sm text-gray-600">Seats</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{car.fuel_type}</p>
                        <p className="text-sm text-gray-600">Fuel</p>
                      </div>
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                          car.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {car.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    {car.description && (
                      <p className="text-gray-700 mb-4">{car.description}</p>
                    )}

                    {/* Features */}
                    {car.features && car.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {car.features.slice(0, 5).map((feature, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                          {car.features.length > 5 && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              +{car.features.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleAvailability(car.id, car.is_available)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          car.is_available
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {car.is_available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      
                      <button
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyListingsPage
