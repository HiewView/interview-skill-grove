
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, LogOut } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = false; // TODO: Replace with actual auth state

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HireView</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</Link>
            <Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-orange-500 transition-colors">Contact</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-orange-500 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-500 hover:to-red-600 transition-all font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
