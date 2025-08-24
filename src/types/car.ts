export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: string;
  isAvailable: boolean;
  features: string[];
  imageUrl: string;
  description?: string;
  fuelType?: string;
  transmission?: string;
  seats?: number;
}

export interface CarFilters {
  make?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  isAvailable?: boolean;
}
