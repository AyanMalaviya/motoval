import { supabase } from './supabaseClient'

export interface UserCar {
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

export const carDatabaseService = {
  // Get all available cars for listing page
  async getAllAvailableCars(): Promise<UserCar[]> {
    try {
      const { data, error } = await supabase
        .from('user_cars')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('✅ Fetched cars from database:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error fetching cars:', error)
      return []
    }
  },

  // Upload car with images
  async uploadCar(carData: Partial<UserCar>, imageFiles: File[]): Promise<{ success: boolean, car?: UserCar, error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Upload images first
      const imageUrls: string[] = []
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(uploadData.path)

        imageUrls.push(urlData.publicUrl)
      }

      // Insert car data
      const { data, error } = await supabase
        .from('user_cars')
        .insert({
          ...carData,
          user_id: user.id,
          images: imageUrls,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        throw error
      }

      console.log('✅ Car uploaded successfully:', data)
      return { success: true, car: data }
    } catch (error) {
      console.error('Error uploading car:', error)
      return { success: false, error: 'Failed to upload car' }
    }
  },

  // Get user's own cars
  async getUserCars(userId: string): Promise<UserCar[]> {
    try {
      const { data, error } = await supabase
        .from('user_cars')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user cars:', error)
      return []
    }
  }
}
