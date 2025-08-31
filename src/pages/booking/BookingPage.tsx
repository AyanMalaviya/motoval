import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bookingService, type Booking } from '../../services/bookingService'

const BookingsPage: React.FC = () => {
  const { user } = useAuth()
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [userBookingsData, ownerBookingsData] = await Promise.all([
          bookingService.getUserBookings(),
          bookingService.getOwnerBookings()
        ])

        setUserBookings(userBookingsData)
        setOwnerBookings(ownerBookingsData)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    const result = await bookingService.updateBookingStatus(bookingId, status)
    if (result.success) {
      // Update local state
      setOwnerBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      )
      alert('Booking status updated successfully!')
    } else {
      alert('Failed to update booking status')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('renter')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'renter'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Rentals ({userBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('owner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'owner'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Booking Requests ({ownerBookings.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'renter' ? (
            // User's rental bookings
            userBookings.length > 0 ? (
              userBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                      </h3>
                      <p className="text-gray-600">{booking.car?.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-gray-600">{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-gray-600">{booking.total_days} days</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Price</p>
                      <p className="text-gray-600">${booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Message:</strong> {booking.message}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No rental bookings yet</p>
              </div>
            )
          ) : (
            // Owner's booking requests
            ownerBookings.length > 0 ? (
              ownerBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                      </h3>
                      <p className="text-gray-600">
                        Requested by: {booking.renter?.first_name} {booking.renter?.last_name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-gray-600">{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-gray-600">{booking.total_days} days</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Price</p>
                      <p className="text-gray-600">${booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Renter's Message:</strong> {booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No booking requests yet</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingsPage
