import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService, type Booking } from '../../services/bookingService';

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'renter' | 'owner'>('renter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchBookings = async () => {
        if (!user) return;
        
        try {
          setLoading(true);
          const [userBookingsData, ownerBookingsData] = await Promise.all([
            bookingService.getUserBookings(),
            bookingService.getOwnerBookings(),
          ]);
          
          setUserBookings(userBookingsData);
          setOwnerBookings(ownerBookingsData);
          
          // ADD THIS CONSOLE LOG
          console.log('Owner bookings:', ownerBookingsData);
          console.log('Current user ID:', user?.id);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [userBookingsData, ownerBookingsData] = await Promise.all([
          bookingService.getUserBookings(),
          bookingService.getOwnerBookings(),
        ]);
        
        setUserBookings(userBookingsData);
        setOwnerBookings(ownerBookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    const result = await bookingService.updateBookingStatus(bookingId, status);
    
    if (result.success) {
      // Update local state
      setOwnerBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
      alert('Booking status updated successfully!');
    } else {
      alert('Failed to update booking status');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    const result = await bookingService.cancelBooking(bookingId);
    
    if (result.success) {
      // Remove from local state
      setUserBookings(prev => prev.filter(booking => booking.id !== bookingId));
      alert('Booking cancelled successfully!');
    } else {
      alert(result.error || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
            /* User's rental bookings */
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
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                    >
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
                      <p className="text-gray-600">₹{booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Message:</strong> {booking.message}</p>
                    </div>
                  )}

                  {/* CANCEL BUTTON - Only show for pending or approved bookings */}
                  {(booking.status === 'pending' || booking.status === 'approved') && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Booking
                      </button>
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
            /* Owner's booking requests */
            ownerBookings.length > 0 ? (
              ownerBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                      </h3>
                      <p className="text-gray-600">
                        Requested by: {booking.renter?.firstname} {booking.renter?.lastname}
                      </p>
                      {/* RENTER CONTACT DETAILS */}
                      <p className="text-sm text-gray-600 mt-2">
                        📧 Email: <span className="font-medium">{booking.renter?.email || 'Not provided'}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        📱 Phone: <span className="font-medium">{booking.renter?.phone || 'Not provided'}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                    >
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
                      <p className="text-gray-600">₹{booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm">
                        <strong>Renter's Message:</strong> {booking.message}
                      </p>
                    </div>
                  )}

                  {/* WHATSAPP CONTACT BUTTON */}
                  {booking.renter?.phone && (
                    <div className="mb-4">
                      <a
                        href={`https://wa.me/${booking.renter.phone.replace(/\D/g, '')}?text=Hi ${booking.renter.firstname}, regarding your booking request for ${booking.car?.make} ${booking.car?.model} from ${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Contact on WhatsApp
                      </a>
                    </div>
                  )}

                  {/* APPROVE/REJECT BUTTONS */}
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
  );
};

export default BookingsPage;
