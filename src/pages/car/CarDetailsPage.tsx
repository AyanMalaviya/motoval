import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import CarImageGallery from '../../components/car/CarImageGallery'

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

interface CarOwner {
  id: string
  first_name: string
  last_name: string
  phone: string
}

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [car, setCar] = useState<UserCar | null>(null)
  const [owner, setOwner] = useState<CarOwner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch car details
        const { data: carData, error: carError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('id', id)
          .single()

        if (carError) throw carError

        setCar(carData)

        // Fetch owner details
        const { data: ownerData, error: ownerError } = await supabase
          .from('users')
          .select('id, first_name, last_name, phone')
          .eq('id', carData.user_id)
          .single()

        if (ownerError) {
          console.warn('Could not fetch owner details:', ownerError)
        } else {
          setOwner(ownerData)
        }

      } catch (err: any) {
        console.error('Error fetching car details:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [id])

  const calculateDaysBetween = (start: string, end: string): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const totalDays = bookingDates.startDate && bookingDates.endDate 
    ? calculateDaysBetween(bookingDates.startDate, bookingDates.endDate)
    : 0

  const totalPrice = totalDays * (car?.price_per_day || 0)

  const handleBookingRequest = () => {
    if (!user) {
      alert('Please login to book this car')
      navigate('/login')
      return
    }
    
    if (!bookingDates.startDate || !bookingDates.endDate) {
      alert('Please select both start and end dates')
      return
    }

    // Here you would typically create a booking request in your database
    setShowContactForm(true)
  }

  const isOwner = user && car && user.id === car.user_id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Car Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested car could not be found.'}</p>
          <Link
            to="/cars"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Back to Car Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Listings
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="lg:flex">
            {/* Image Gallery */}
            <div className="lg:w-2/3">
              <CarImageGallery
                images={car.images}
                carName={`${car.make} ${car.model}`}
                className="w-full h-96 lg:h-[600px]"
              />
            </div>

            {/* Car Info & Booking */}
            <div className="lg:w-1/3 p-6 lg:p-8">
              {/* Car Title & Price */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {car.make} {car.model}
                </h1>
                <p className="text-lg text-gray-600 mb-4">{car.year} • {car.location}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-blue-600">${car.price_per_day}</span>
                    <span className="text-gray-500"> / day</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    car.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {car.is_available ? 'Available' : 'Not Available'}
                  </span>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {car.category}
                  </span>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {car.seats} seats
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {car.fuel_type}
                    </div>
                    <div className="flex items-center col-span-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {car.transmission}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              {!isOwner && car.is_available && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Book This Car</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={bookingDates.startDate}
                        onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={bookingDates.endDate}
                        onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                        min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {totalDays > 0 && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex justify-between text-sm">
                          <span>${car.price_per_day} × {totalDays} days</span>
                          <span>${totalPrice}</span>
                        </div>
                        <div className="border-t border-blue-200 mt-2 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBookingRequest}
                      disabled={!bookingDates.startDate || !bookingDates.endDate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Owner Actions</h3>
                  <div className="space-y-2">
                    <Link
                      to={`/edit-listing/${car.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors text-center block"
                    >
                      Edit Listing
                    </Link>
                    <Link
                      to="/my-listings"
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors text-center block"
                    >
                      View All My Listings
                    </Link>
                  </div>
                </div>
              )}

              {/* Owner Contact Info */}
              {!isOwner && owner && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Car Owner</h3>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {owner.first_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {owner.first_name} {owner.last_name}
                      </p>
                      {owner.phone && (
                        <p className="text-sm text-gray-600">{owner.phone}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Contact Owner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Car Details Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Car</h2>
              {car.description ? (
                <p className="text-gray-700 leading-relaxed">{car.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided by the owner.</p>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Make:</span>
                    <span className="ml-2 text-gray-600">{car.make}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Model:</span>
                    <span className="ml-2 text-gray-600">{car.model}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Year:</span>
                    <span className="ml-2 text-gray-600">{car.year}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 text-gray-600">{car.category}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Seats:</span>
                    <span className="ml-2 text-gray-600">{car.seats}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Fuel Type:</span>
                    <span className="ml-2 text-gray-600">{car.fuel_type}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Transmission:</span>
                    <span className="ml-2 text-gray-600">{car.transmission}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2 text-gray-600">{car.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
              {car.features && car.features.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No specific features listed for this vehicle.</p>
              )}

              {/* Rental Policies */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rental Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Valid driver's license required</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Minimum age: 21 years old</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Return with same fuel level</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Contact owner before pickup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contact Car Owner</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {totalDays > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <p><strong>Rental Request:</strong></p>
                    <p>{car.make} {car.model} ({car.year})</p>
                    <p>Dates: {bookingDates.startDate} to {bookingDates.endDate}</p>
                    <p>Duration: {totalDays} days</p>
                    <p>Total: ${totalPrice}</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Owner:</strong> {owner?.first_name} {owner?.last_name}
                  </p>
                  {owner?.phone && (
                    <p className="mb-2">
                      <strong>Phone:</strong> 
                      <a href={`tel:${owner.phone}`} className="text-blue-600 ml-1">
                        {owner.phone}
                      </a>
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                  >
                    Close
                  </button>
                  {owner?.phone && (
                    <a
                      href={`tel:${owner.phone}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-center transition-colors"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarDetailsPage
