import { supabase } from './supabaseClient'

export interface Review {
  id: string
  car_id: string
  reviewer_id: string
  booking_id: string
  rating: number
  comment: string
  created_at: string
  // Joined data
  reviewer?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export const reviewService = {
  // Create a review
  async createReview(
    carId: string,
    bookingId: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          car_id: carId,
          reviewer_id: user.id,
          booking_id: bookingId,
          rating,
          comment
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, review }
    } catch (error: any) {
      console.error('Error creating review:', error)
      return { success: false, error: error.message }
    }
  },

  // Get reviews for a car
  async getCarReviews(carId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviewer_id(first_name, last_name, avatar_url)
        `)
        .eq('car_id', carId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching car reviews:', error)
      return []
    }
  },

  // Get average rating for a car
  async getCarAverageRating(carId: string): Promise<{ average: number; count: number }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('car_id', carId)

      if (error) throw error

      if (!data || data.length === 0) {
        return { average: 0, count: 0 }
      }

      const total = data.reduce((sum, review) => sum + review.rating, 0)
      const average = total / data.length

      return { average: Math.round(average * 10) / 10, count: data.length }
    } catch (error) {
      console.error('Error calculating car rating:', error)
      return { average: 0, count: 0 }
    }
  }
}
