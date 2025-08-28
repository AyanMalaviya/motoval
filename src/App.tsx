import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/common/Header/Header'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CarListingPage from './pages/car/CarListingPage'
import AddCarPage from './pages/car/AddCarPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MyListingsPage from './pages/car/MyListingPage'
import './styles/globals.css'
import EditListingPage from './pages/car/EditListingPage'
import CarDetailsPage from './pages/car/CarDetailsPage'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cars" element={<CarListingPage />} />
            <Route path="/add-car" element={<AddCarPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} />
            <Route path="/edit-listing/:id" element={<EditListingPage/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<div className="p-8">Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
