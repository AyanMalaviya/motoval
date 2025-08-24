import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import { useAuth } from '../../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center">
              <img src="../../public/images/logos/carrental.png" alt="carrental logo" />
            </div>
            <span className="text-white text-xl font-bold">CarRental</span>
          </Link>

          {/* Navigation */}
          <Navigation user={user} isAuthenticated={isAuthenticated} />

          {/* User Menu */}
          <UserMenu
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={logout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
