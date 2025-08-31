import { Link, useLocation } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

interface NavigationProps {
  user: User | null
  isAuthenticated: boolean
}

const Navigation: React.FC<NavigationProps> = ({ user, isAuthenticated }) => {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path
  
  const linkClass = (path: string) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-gray-300 hover:bg-blue-600 hover:text-white'
    }`

  return (
    <nav className="flex space-x-4">
      <Link to="/" className={linkClass('/')}>
        Home
      </Link>
      <Link to="/cars" className={linkClass('/cars')}>
        Browse Cars
      </Link>
      <Link to="/about" className={linkClass('/about')}>
        About
      </Link>
      
      {isAuthenticated && (
        <>
          <Link to="/add-car" className={linkClass('/add-car')}>
            List Your Car
          </Link>
          <Link to="/my-listings" className={linkClass('/my-listings')}>
            My Listings
          </Link>
          <Link to="/bookings" className={linkClass('/bookings')}>
            Bookings
          </Link>
          <Link to="/profile" className={linkClass('/profile')}>
            Profile
          </Link>
        </>
      )}
      
      {isAuthenticated && user?.user_metadata?.role === 'admin' && (
        <Link to="/admin" className={linkClass('/admin')}>
          Admin Panel
        </Link>
      )}
    </nav>
  )
}

export default Navigation
