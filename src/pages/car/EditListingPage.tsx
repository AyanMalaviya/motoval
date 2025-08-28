import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'
import CarImageGallery from '../../components/car/CarImageGallery'

interface UserCar {
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

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [car, setCar] = useState<UserCar | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: '',
    category: 'Sedan',
    description: '',
    seats: 5,
    fuel_type: 'Gasoline',
    transmission: 'Automatic',
    location: '',
    features: [] as string[]
  })
  
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const categories = ['Sedan', 'SUV', 'Hatchback', 'Sports', 'Electric', 'Luxury', 'Truck', 'Convertible']
  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid']
  const transmissionTypes = ['Automatic', 'Manual', 'CVT']
  const availableFeatures = [
    'AC', 'Bluetooth', 'GPS Navigation', 'Backup Camera', 'Heated Seats',
    'Sunroof', 'Leather Seats', 'Premium Sound', 'AWD/4WD', 'Cruise Control',
    'Keyless Entry', 'USB Charging', 'Apple CarPlay', 'Android Auto', 'WiFi Hotspot'
  ]

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      if (!user || !id) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('user_cars')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          setCar(data)
          setFormData({
            make: data.make,
            model: data.model,
            year: data.year,
            price_per_day: data.price_per_day.toString(),
            category: data.category,
            description: data.description || '',
            seats: data.seats,
            fuel_type: data.fuel_type,
            transmission: data.transmission,
            location: data.location,
            features: data.features || []
          })
        }
      } catch (err: any) {
        console.error('Error fetching car:', err)
        setError(`Failed to load car: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [user, id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'seats' ? parseInt(value) : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const selectedFiles = Array.from(files).slice(0, 5) // Max 5 images
      setNewImages(selectedFiles)
      
      // Create previews
      const previews = selectedFiles.map(file => URL.createObjectURL(file))
      setNewImagePreviews(previews)
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleDeleteImage = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !car) return

    setSubmitting(true)
    setMessage('')
    setError(null)

    try {
      // Upload new images if any
      const newImageUrls: string[] = []
      
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i]
        const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage
          .from('car-images')
          .getPublicUrl(uploadData.path)

        newImageUrls.push(urlData.publicUrl)
      }

      // Update existing images (remove deleted ones, add new ones)
      const updatedImages = [
        ...car.images.filter(img => !imagesToDelete.includes(img)),
        ...newImageUrls
      ]

      // Update car data
      const { error: updateError } = await supabase
        .from('user_cars')
        .update({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          price_per_day: parseFloat(formData.price_per_day),
          category: formData.category,
          description: formData.description,
          seats: formData.seats,
          fuel_type: formData.fuel_type,
          transmission: formData.transmission,
          location: formData.location,
          features: formData.features,
          images: updatedImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', car.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      // Delete old images from storage
      for (const imageUrl of imagesToDelete) {
        try {
          const path = imageUrl.split('/').pop()
          if (path) {
            await supabase.storage
              .from('car-images')
              .remove([`${user.id}/${path}`])
          }
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError)
        }
      }

      setMessage('✅ Car listing updated successfully!')
      setTimeout(() => navigate('/my-listings'), 2000)

    } catch (err: any) {
      console.error('Error updating car:', err)
      setError(`Failed to update car: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600">You need to be logged in to edit listings</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-listings')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h2>
          <p className="text-gray-600">The car listing was not found or you don't have permission to edit it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Car Listing</h1>
            <p className="text-gray-600">Update your car details and images</p>
          </div>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-md mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Current Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Images</h3>
            {car.images && car.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {car.images
                  .filter(img => !imagesToDelete.includes(img))
                  .map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Car image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://via.placeholder.com/400x250/e5e7eb/6b7280?text=Failed+to+Load'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No images uploaded yet</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Car Information - Same as AddCarPage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day ($) *</label>
                <input
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleInputChange}
                  min="10"
                  step="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Car Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                <select
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2, 4, 5, 7, 8].map(num => (
                    <option key={num} value={num}>{num} seats</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Add New Images (Max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="new-image-upload"
                />
                <label htmlFor="new-image-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900">Click to upload new images</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                  </div>
                </label>
              </div>

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-200"
                      />
                      <span className="absolute top-1 left-1 bg-green-500 text-white px-1 text-xs rounded">
                        NEW
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {submitting ? 'Updating...' : 'Update Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditListingPage
