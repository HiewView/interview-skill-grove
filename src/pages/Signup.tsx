
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowLeft, User, Building } from 'lucide-react';

type UserType = 'candidate' | 'organization';

const Signup: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement actual registration
      console.log('Signup attempt:', { ...formData, userType });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-white/80 hover:text-yellow-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-yellow-500">HireView</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join thousands of professionals using HireView</p>
          </div>

          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUserType('candidate')}
              className={`p-4 rounded-lg border transition-all ${
                userType === 'candidate'
                  ? 'bg-yellow-500/20 border-yellow-500 text-white'
                  : 'bg-black border-white/20 text-white/70 hover:bg-white/5'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Candidate</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('organization')}
              className={`p-4 rounded-lg border transition-all ${
                userType === 'organization'
                  ? 'bg-yellow-500/20 border-yellow-500 text-white'
                  : 'bg-black border-white/20 text-white/70 hover:bg-white/5'
              }`}
            >
              <Building className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Organization</div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                {userType === 'candidate' ? 'Full Name' : 'Contact Person Name'}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
            </div>

            {userType === 'organization' && (
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-white/80 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Enter organization name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-4 h-4 text-yellow-500 bg-black border-white/20 rounded focus:ring-yellow-500 focus:ring-2 mt-1"
              />
              <label htmlFor="termsAccepted" className="text-sm text-white/70">
                I agree to the{' '}
                <Link to="/terms" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
