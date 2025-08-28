import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import { useAuth } from '../../../context/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;

  return (
    <header className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              className="h-16 w-auto "
              src="../../public/images/logos/CarRentalLogo.png"
              alt="Car Rental Logo"
            />
          </Link>

          {/* Navigation */}
          <Navigation user={user} isAuthenticated={isAuthenticated} />

          {/* User Menu */}
          <UserMenu
            user={user}
            isAuthenticated={isAuthenticated}
            onLogout={signOut}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
