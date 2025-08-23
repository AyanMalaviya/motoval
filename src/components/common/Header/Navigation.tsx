import { Link, useLocation } from 'react-router-dom';
import { User } from '../../../types/auth';

interface NavigationProps {
  user: User | null;
  isAuthenticated: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ user, isAuthenticated }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const linkClass = (path: string) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-gray-300 hover:bg-blue-600 hover:text-white'
    }`;

  return (
    <nav className="flex space-x-4">
      <Link to="/" className={linkClass('/')}>
        Home
      </Link>
      <Link to="/cars" className={linkClass('/cars')}>
        Cars
      </Link>
      <Link to="/about" className={linkClass('/about')}>
        About
      </Link>
      <Link to="/contact" className={linkClass('/contact')}>
        Contact
      </Link>
      
      {isAuthenticated && user ? (
        <>
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" className={linkClass('/admin')}>
              Admin Panel
            </Link>
          )}
        </>
      ) : null}
    </nav>
  );
};

export default Navigation;
