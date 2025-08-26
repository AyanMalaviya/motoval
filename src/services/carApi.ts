import axios from 'axios'

const API_BASE_URL = 'https://carapi.app/api'

// Free tier - no authentication required for basic endpoints
const carApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export interface CarAPIResponse {
  id: number
  make_id: number
  make_model_id: number
  make_model_trim_id: number
  year: number
  make: string
  model: string
  trim?: string
  body?: string
  engine?: string
  engine_cc?: number
  engine_fuel?: string
  transmission_type?: string
  seats?: number
  doors?: number
  sold_in_us?: boolean
}

export const carApiService = {
  // Get sample rental cars (4-5 cars only)
  getSampleRentalCars: async () => {
    try {
      // Strategy: Get specific makes that are common in rental fleets
      const rentalMakes = ['Toyota', 'Ford', 'Chevrolet', 'Nissan', 'Honda']
      const rentalCars = []

      // Get one car from each popular rental brand
      for (let i = 0; i < Math.min(5, rentalMakes.length); i++) {
        try {
          // Get makes first to find the make_id
          const makesResponse = await carApiClient.get(`/makes?make=${rentalMakes[i]}&limit=1`)
          
          if (makesResponse.data && makesResponse.data.length > 0) {
            const makeId = makesResponse.data[0].id
            
            // Get popular models for this make
            const modelsResponse = await carApiClient.get(`/models?make_id=${makeId}&limit=1`)
            
            if (modelsResponse.data && modelsResponse.data.length > 0) {
              const modelId = modelsResponse.data[0].id
              
              // Get recent trims for this model (2020+)
              const trimsResponse = await carApiClient.get(`/trims?make_id=${makeId}&model_id=${modelId}&year=2020&limit=1`)
              
              if (trimsResponse.data && trimsResponse.data.length > 0) {
                rentalCars.push(trimsResponse.data[0])
              }
            }
          }
        } catch (error) {
          console.log(`Failed to fetch data for ${rentalMakes[i]}`)
          continue
        }
      }

      return rentalCars
    } catch (error) {
      console.error('Error fetching rental cars:', error)
      throw error
    }
  },

  // Alternative simpler approach - get recent trims and filter
  getRecentRentalCars: async () => {
    try {
      // Get recent cars (2020+) with limit
      const response = await carApiClient.get('/trims?year=2020&limit=10')
      
      if (response.data && Array.isArray(response.data)) {
        // Filter for rental-suitable cars (sold in US, reasonable specs)
        const rentalSuitableCars = response.data.filter((car: CarAPIResponse) => {
          return (
            car.sold_in_us === true &&
            car.year >= 2020 &&
            car.seats && car.seats >= 4 &&
            car.doors && car.doors >= 4 &&
            // Filter for common rental body types
            (car.body?.toLowerCase().includes('sedan') ||
             car.body?.toLowerCase().includes('suv') ||
             car.body?.toLowerCase().includes('hatchback') ||
             car.body?.toLowerCase().includes('crossover'))
          )
        })
        
        // Return only first 5 cars
        return rentalSuitableCars.slice(0, 5)
      }
      
      return []
    } catch (error) {
      console.error('Error fetching recent rental cars:', error)
      throw error
    }
  },

  // Test connection with minimal request
  testConnection: async () => {
    try {
      const response = await carApiClient.get('/makes?limit=1')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('CarAPI connection test failed:', error)
      return { success: false, error }
    }
  }
}
