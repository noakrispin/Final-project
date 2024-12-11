
import React, { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ErrorMessage from '../components/shared/ErrorMessage';
import toast, { Toaster } from 'react-hot-toast'; 
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or Email is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:3001/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Login successful!');
          login(data.user); // Store user info in context
          navigate('/');
        } else {
          toast.error(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        toast.error('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center items-center py-12">
      {/* Background blur elements */}
      <div className="absolute top-[338px] left-[610px] w-[300px] h-[294px] bg-[#8bd8ff]/40 rounded-tl-[481.50px] rounded-tr-[600px] rounded-bl-[481.50px] rounded-br-[600px] blur-[80px]" />
      <div className="absolute bottom-0 left-[-352px] w-[1000px] h-[1018.69px] bg-[#c8d7ff]/70 rounded-[471.19px] blur-[70px]" />

      {/* Main Content */}
      <div className="w-full max-w-[562px] bg-white shadow-md border border-[#d3d3d3] rounded-[20px] relative z-10 p-8">
        <h2 className="text-[26px] font-semibold text-gray-600 mb-2">Login</h2>
        <p className="text-lg text-gray-600 mb-6">Login to access the Final Project Portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-gray-600 mb-1">Username or Email</label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              className="w-full h-[55px] px-4 border border-[#dadada] rounded-md"
              placeholder="Enter your username or email"
            />
            <ErrorMessage message={errors.usernameOrEmail} />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full h-[55px] px-4 border border-[#dadada] rounded-md"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <ErrorMessage message={errors.password} />
          </div>

          <Button
            type="submit"
            className="w-full h-[60px] bg-[#5f6fff] hover:bg-[#4b5ccc] text-white text-lg font-medium rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center text-gray-600 text-base">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#5f6fff] underline">
              Create account
            </Link>
          </p>
        </form>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default Login;
