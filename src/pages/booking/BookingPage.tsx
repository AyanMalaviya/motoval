import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService, type Booking } from '../../services/bookingService';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';

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
          bookingService.getOwnerBookings()
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  if (loading) {
    return <Loading fullScreen text="Loading bookings..." size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          My Bookings
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('renter')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'renter'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              My Rentals ({userBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('owner')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'owner'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Booking Requests ({ownerBookings.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'renter' ? (
            userBookings.length > 0 ? (
              userBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        {booking.car?.make} {booking.car?.model} {booking.car?.year ? `(${booking.car.year})` : ''}
                      </h3>
                      <p className="text-gray-400 mt-1">{booking.car?.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-400">Start Date</p>
                      <p className="text-white">{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">End Date</p>
                      <p className="text-white">{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Duration</p>
                      <p className="text-white">{booking.total_days} days</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Total Price</p>
                      <p className="text-white font-semibold">${booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400"><strong>Message:</strong> {booking.message}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400">No rental bookings yet</p>
              </div>
            )
          ) : (
            ownerBookings.length > 0 ? (
              ownerBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        {booking.car?.make} {booking.car?.model} {booking.car?.year ? `(${booking.car.year})` : ''}
                      </h3>
                      <p className="text-gray-400 mt-1">
                        Requested by: {booking.renter?.first_name || 'Unknown'} {booking.renter?.last_name || ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-medium text-gray-400">Start Date</p>
                      <p className="text-white">{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">End Date</p>
                      <p className="text-white">{new Date(booking.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Duration</p>
                      <p className="text-white">{booking.total_days} days</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Total Price</p>
                      <p className="text-white font-semibold">${booking.total_price}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400"><strong>Renter's Message:</strong> {booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        variant="primary"
                        size={"sm" as const}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        variant="danger"
                        size={"sm" as const}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400">No booking requests yet</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;
