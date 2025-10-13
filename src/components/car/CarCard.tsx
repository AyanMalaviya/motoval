import React from 'react';
import { Link } from 'react-router-dom';
import CarImageGallery from './CarImageGallery';
import Button from '../common/UI/Button';
import type { Car } from '../../types/car';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const images = car.images && Array.isArray(car.images) ? car.images : [car.imageUrl];

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 group">
      <div className="relative overflow-hidden">
        <CarImageGallery
          images={images}
          carName={`${car.make} ${car.model}`}
          className="w-full h-56 transform group-hover:scale-110 transition-transform duration-500"
        />
        
        {!car.isAvailable && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Unavailable
            </span>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm">
            {car.category}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              {car.make} {car.model}
            </h3>
            <p className="text-gray-400 text-sm font-medium">{car.year}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ${car.pricePerDay}
            </p>
            <p className="text-xs text-gray-500 font-medium">per day</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-400 mb-4 gap-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{car.seats || 4} seats</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{car.fuelType || 'Gasoline'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {car.features.slice(0, 2).map((feature, index) => (
              <span key={index} className="bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                {feature}
              </span>
            ))}
            {car.features.length > 2 && (
              <span className="bg-gray-800 border border-gray-700 text-purple-400 px-2.5 py-1 rounded-lg text-xs font-medium">
                +{car.features.length - 2}
              </span>
            )}
          </div>
          
          <Link to={`/cars/${car.id}`}>
            <Button variant="primary" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
