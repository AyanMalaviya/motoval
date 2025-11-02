import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CarListingPage from './pages/car/CarListingPage';
import CarDetailsPage from './pages/car/CarDetailsPage';
import AddCarPage from './pages/car/AddCarPage';
import EditListingPage from './pages/car/EditListingPage';
import MyListingsPage from './pages/car/MyListingPage';
import ProfilePage from './pages/user/ProfilePage';
import BookingsPage from './pages/booking/BookingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import './styles/globals.css';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/user/DashboardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-950">
          <Header />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cars" element={<CarListingPage />} />
              <Route path="/cars/:id" element={<CarDetailsPage />} />
              <Route path="/add-car" element={<AddCarPage />} />
              <Route path="/edit-listing/:id" element={<EditListingPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

// 404 Page Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </a>
          <a
            href="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Browse Cars
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
