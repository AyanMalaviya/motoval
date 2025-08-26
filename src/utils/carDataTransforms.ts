import type { Car } from '../types/car'

export const transformApiNinjasCar = (car: any): Car => ({
  id: `${car.make}-${car.model}-${car.year}`,
  make: car.make || 'Unknown',
  model: car.model || 'Unknown',
  year: car.year || 2023,
  pricePerDay: calculateRentalPrice(car),
  category: determineCategory(car),
  isAvailable: Math.random() > 0.2,
  features: generateFeatures(car),
  imageUrl: generateCarImageUrl(car.make, car.model),
  seats: 5,
  fuelType: car.fuel_type || 'Gasoline',
  transmission: car.transmission || 'Automatic',
  description: `${car.year} ${car.make} ${car.model}`
})

export const transformCarQueryCar = (car: any): Car => ({
  id: car.model_id,
  make: car.model_make_display,
  model: car.model_name,
  year: parseInt(car.model_year),
  pricePerDay: 45, // Default rental price
  category: determineCategory(car),
  isAvailable: true,
  features: ['AC', 'Radio', 'Bluetooth'],
  imageUrl: generateCarImageUrl(car.model_make_display, car.model_name),
  seats: parseInt(car.model_seats) || 5,
  fuelType: car.model_engine_type || 'Gasoline',
  transmission: car.model_transmission_type || 'Automatic',
  description: `${car.model_year} ${car.model_make_display} ${car.model_name}`
})

const calculateRentalPrice = (car: any): number => {
  let basePrice = 45
  if (car.year >= 2023) basePrice += 15
  if (car.horsepower > 200) basePrice += 10
  return basePrice
}

const determineCategory = (car: any): string => {
  const body = car.model_body?.toLowerCase() || car.body?.toLowerCase() || ''
  if (body.includes('suv')) return 'SUV'
  if (body.includes('sedan')) return 'Sedan'
  if (body.includes('truck')) return 'Truck'
  return 'Sedan'
}

const generateFeatures = (car: any): string[] => {
  const features = ['AC', 'Radio']
  if (car.year >= 2020) features.push('Bluetooth', 'USB')
  if (car.year >= 2022) features.push('Apple CarPlay')
  return features
}

const generateCarImageUrl = (make: string, model: string): string => {
  const carImages = {
    'Toyota Camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Ford Escape': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'Chevrolet Malibu': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  }
  
  const key = `${make} ${model}`
  return carImages[key as keyof typeof carImages] || 
         'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
}
