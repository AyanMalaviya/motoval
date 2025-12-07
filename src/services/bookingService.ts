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
  booking_expires_at?: string;
  created_at: string;
  updated_at: string;
  car?: any;
  renter?: any;
  owner?: any;
}

export const bookingService = {
  // Check if car is available for date range
  async checkAvailability(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<{ available: boolean; conflictingBookings?: Booking[] }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('car_id', carId)
        .in('status', ['approved', 'pending'])
        .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

      if (error) throw error;

      return {
        available: !data || data.length === 0,
        conflictingBookings: data || []
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: false };
    }
  },

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

      // Check user profile completeness
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('phone, phone_verified, driver_license_number, driver_license_expiry')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error('Failed to fetch user profile');

      if (!userProfile.phone) {
        throw new Error('Please add your phone number in profile');
      }

      if (!userProfile.phone_verified) {
        throw new Error('Please verify your phone number before booking');
      }

      if (!userProfile.driver_license_number || !userProfile.driver_license_expiry) {
        throw new Error('Please add your driver license details in profile');
      }

      // Check if license is expired
      if (new Date(userProfile.driver_license_expiry) < new Date()) {
        throw new Error('Your driver license has expired. Please update it.');
      }

      // Check car availability
      const availability = await this.checkAvailability(carId, startDate, endDate);
      if (!availability.available) {
        throw new Error('Car is not available for the selected dates');
      }

      // Get car details
      const { data: car, error: carError } = await supabase
        .from('user_cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (carError || !car) throw new Error('Car not found');

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

  // Get bookings for user's cars (as owner)
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
          renter:users!renter_id(id, first_name, last_name, phone, email, driver_license_number, driver_license_expiry)
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

  async cancelBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete the booking (only if user is the renter)
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('renter_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error.message };
    }
  },


  // Update booking status (owner only)
  async updateBookingStatus(
    bookingId: string,
    status: Booking['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error.message };
    }
  }
};

