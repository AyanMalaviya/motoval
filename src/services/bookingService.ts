import { supabase } from './supabaseClient';

export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  car?: any;
  renter?: any;
  owner?: any;
}

export const bookingService = {
  // Create a new booking request
  async createBooking(
    carId: string,
    startDate: string,
    endDate: string,
    message?: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get car details and owner
      const { data: car, error: carError } = await supabase
        .from('user_cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (carError || !car) throw new Error('Car not found');

      // Check if car is available
      if (!car.is_available) {
        throw new Error('This car is no longer available');
      }

      // Calculate days and total price
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (totalDays <= 0) {
        throw new Error('End date must be after start date');
      }

      const totalPrice = totalDays * car.price_per_day;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          car_id: carId,
          renter_id: user.id,
          owner_id: car.user_id,
          start_date: startDate,
          end_date: endDate,
          total_days: totalDays,
          total_price: totalPrice,
          message: message || '',
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      return { success: true, booking };
    } catch (error: any) {
      console.error('Booking creation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's bookings (as renter)
  async getUserBookings(userId?: string): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:user_cars(*)
        `)
        .eq('renter_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  },

  // Get bookings for user's cars (as owner) - WITH RENTER INFO INCLUDING PHONE
  async getOwnerBookings(userId?: string): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:user_cars(*),
          renter:users!renter_id(id, first_name, last_name, phone, email)
        `)
        .eq('owner_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
      return [];
    }
  },

  // Update booking status (owner only) - ALSO UPDATE CAR AVAILABILITY
  async updateBookingStatus(
    bookingId: string,
    status: Booking['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the booking first to get car_id
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('car_id, owner_id')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) throw new Error('Booking not found');
      if (booking.owner_id !== user.id) throw new Error('Unauthorized');

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      // If booking is approved, mark car as unavailable
      if (status === 'approved') {
        const { error: carError } = await supabase
          .from('user_cars')
          .update({ is_available: false })
          .eq('id', booking.car_id);

        if (carError) throw carError;
      }

      // If booking is rejected or cancelled, mark car as available again
      if (status === 'rejected' || status === 'cancelled') {
        const { error: carError } = await supabase
          .from('user_cars')
          .update({ is_available: true })
          .eq('id', booking.car_id);

        if (carError) throw carError;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error.message };
    }
  }
};
