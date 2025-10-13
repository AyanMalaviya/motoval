import React, { useState } from 'react';

interface CarImageGalleryProps {
  images: string[];
  carName: string;
  className?: string;
}

const CarImageGallery: React.FC<CarImageGalleryProps> = ({ images, carName, className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  const validImages = images.filter((_, index) => !imageErrors.has(index));
  const fallbackImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

  if (validImages.length === 0) {
    return (
      <img
        src={fallbackImage}
        alt={carName}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className="relative group">
      {/* Main Image */}
      <img
        src={validImages[currentImageIndex] || fallbackImage}
        alt={`${carName} - Image ${currentImageIndex + 1}`}
        className={`object-cover ${className}`}
        onError={() => handleImageError(currentImageIndex)}
      />

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
          {currentImageIndex + 1} / {validImages.length}
        </div>
      )}

      {/* Navigation Arrows */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={() => setCurrentImageIndex(prev => prev === 0 ? validImages.length - 1 : prev - 1)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentImageIndex(prev => prev === validImages.length - 1 ? 0 : prev + 1)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-purple-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Thumbnail Indicators */}
      {validImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentImageIndex 
                  ? 'w-8 h-2 bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
