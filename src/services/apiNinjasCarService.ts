import axios from 'axios'

const API_BASE_URL = 'https://api.api-ninjas.com/v1/cars'
const API_KEY = 'YOUR_API_KEY' // Get free key from https://api.api-ninjas.com

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-Api-Key': API_KEY,
  },
  timeout: 10000,
})

export interface ApiNinjasCar {
  make: string
  model: string
  year: number
  cylinders: number
  displacement: number
  horsepower: number
  torque: number
  transmission: string
  drive: string
  fuel_type: string
}

export const apiNinjasCarService = {
  // Get cars with filtering
  getCars: async (params?: {
    make?: string
    model?: string
    year?: number
    fuel_type?: string
    cylinders?: number
    transmission?: string
    drive?: string
    limit?: number
  }) => {
    try {
      const response = await apiClient.get('', { params })
      return response.data
    } catch (error) {
      console.error('API Ninjas Cars API error:', error)
      throw error
    }
  },

  // Get sample rental cars
  getSampleRentalCars: async () => {
    try {
      const response = await apiClient.get('', {
        params: {
          limit: 5,
          year: 2020, // Recent cars suitable for rental
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching sample rental cars:', error)
      throw error
    }
  }
}
