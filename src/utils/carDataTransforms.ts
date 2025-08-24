import type { Car } from '../types/car';
import type { CarAPIResponse } from '../services/carApi';

// Transform CarAPI.app data to your Car interface
export const transformCarAPIData = (apiData: CarAPIResponse): Car => {
  return {
    id: apiData.id.toString(),
    make: apiData.make,
    model: apiData.model,
    year: apiData.year,
    pricePerDay: calculateRentalPrice(apiData),
    category: determineCategory(apiData),
    isAvailable: Math.random() > 0.2, // 80% availability rate
    features: generateFeatures(apiData),
    imageUrl: generateCarImageUrl(apiData),
    seats: apiData.seats || 4,
    fuelType: determineFuelType(apiData.engine_fuel),
    transmission: apiData.transmission_type || 'Automatic',
    description: `${apiData.year} ${apiData.make} ${apiData.model}${apiData.trim ? ` ${apiData.trim}` : ''}`
  };
};

// Helper functions
const calculateRentalPrice = (car: CarAPIResponse): number => {
  let basePrice = 40; // Base rental price
  
  // Adjust based on year
  if (car.year >= 2022) basePrice += 30;
  else if (car.year >= 2018) basePrice += 20;
  else if (car.year >= 2015) basePrice += 10;
  
  // Adjust based on engine power
  if (car.engine_power_ps && car.engine_power_ps > 300) basePrice += 50;
  else if (car.engine_power_ps && car.engine_power_ps > 200) basePrice += 30;
  
  // Luxury brands premium
  const luxuryBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche'];
  if (luxuryBrands.includes(car.make)) basePrice += 40;
  
  return Math.round(basePrice);
};

const determineCategory = (car: CarAPIResponse): string => {
  const body = car.body?.toLowerCase() || '';
  
  if (body.includes('suv') || body.includes('crossover')) return 'SUV';
  if (body.includes('sedan') || body.includes('saloon')) return 'Sedan';
  if (body.includes('hatchback')) return 'Hatchback';
  if (body.includes('coupe') || body.includes('sports')) return 'Sports';
  if (body.includes('wagon') || body.includes('estate')) return 'Wagon';
  if (car.engine_fuel === 'Electric') return 'Electric';
  
  // Luxury brands default to luxury category
  const luxuryBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus'];
  if (luxuryBrands.includes(car.make)) return 'Luxury';
  
  return 'Sedan'; // Default
};

const generateFeatures = (car: CarAPIResponse): string[] => {
  const features: string[] = ['AC', 'Radio'];
  
  if (car.year >= 2018) features.push('Bluetooth', 'USB Charging');
  if (car.year >= 2020) features.push('Apple CarPlay', 'Android Auto');
  if (car.engine_power_ps && car.engine_power_ps > 200) features.push('Sport Mode');
  if (car.drive?.includes('4') || car.drive?.includes('awd')) features.push('AWD');
  
  const luxuryBrands = ['BMW', 'Mercedes-Benz', 'Audi', 'Lexus'];
  if (luxuryBrands.includes(car.make)) {
    features.push('Leather Seats', 'Premium Sound', 'Navigation');
  }
  
  return features;
};

const determineFuelType = (engineFuel?: string): string => {
  if (!engineFuel) return 'Gasoline';
  
  const fuel = engineFuel.toLowerCase();
  if (fuel.includes('electric')) return 'Electric';
  if (fuel.includes('diesel')) return 'Diesel';
  if (fuel.includes('hybrid')) return 'Hybrid';
  
  return 'Gasoline';
};

const generateCarImageUrl = (car: CarAPIResponse): string => {
  // Generate placeholder image URL
  const makeModel = `${car.make}+${car.model}`.replace(/\s+/g, '+');
  return `https://via.placeholder.com/400x250/3b82f6/ffffff?text=${makeModel}`;
};
