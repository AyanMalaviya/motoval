import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Button from '../../components/common/UI/Button';
import Loading from '../../components/common/UI/Loading';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  car: {
    make: string;
    model: string;
    images: string[];
  };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*, car:car_id(make, model, images)')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (fetchError) {
            setError("You do not have any bookings yet")
        }
        else if (error) {
            throw error;
        }

        setBookings(data || []);
      } catch (err: any) {
        setError(`Failed to find you id in database: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loading size="lg" fullScreen text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
        Welcome Back, {user?.email?.split('@')[0]}
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">My Bookings</h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}
        {bookings.length === 0 ? (
          <p className="text-gray-400">You have no bookings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden group hover:border-purple-500/70">
                <div className="h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={booking.car.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={`${booking.car.make} ${booking.car.model}`}
                    className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {booking.car.make} {booking.car.model}
                  </h3>
                  <p className="text-sm text-gray-400 mb-1">
                    Rental from <span className="font-semibold">{new Date(booking.start_date).toLocaleDateString()}</span> to <span className="font-semibold">{new Date(booking.end_date).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Total Price: <span className="font-semibold">${booking.total_price.toFixed(2)}</span>
                  </p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.status === 'pending'
                      ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-400'
                      : booking.status === 'confirmed'
                      ? 'bg-green-500/30 text-green-400 border border-green-400'
                      : 'bg-red-500/30 text-red-400 border border-red-400'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Need help?</h2>
        <p className="text-gray-400 mb-6">
          If you have any questions, please feel free to contact our support team.
        </p>
        <Link to ="/cars">
            <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/contact'}
            fullWidth
            >
            Contact Support
            </Button>
        </Link>
      </section>
    </div>
  );
};

export default DashboardPage;
