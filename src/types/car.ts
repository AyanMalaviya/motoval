export interface Car {
  id: string
  make: string
  model: string
  year: number
  pricePerDay: number
  category: string
  isAvailable: boolean
  features: string[]
  imageUrl: string // Keep for backward compatibility
  images?: string[] // Add this for multiple images
  seats?: number
  fuelType?: string
  transmission?: string
  description?: string
}


export interface CarFilters {
  make?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  isAvailable?: boolean;
}
