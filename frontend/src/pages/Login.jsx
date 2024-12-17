import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import ErrorMessage from '../components/shared/ErrorMessage';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Import mock user data for testing
import usersData from '../data/mockUsers.json';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = usersData.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (user) {
        toast.success('Login successful! Connecting...', {
          duration: 3000,
          position: 'top-center',
        });

        setTimeout(() => {
          toast.success(`Welcome back, ${user.fullName}!`, {
            duration: 3000,
            position: 'top-center',
          });

          login(user);
          navigate('/');
        }, 2000);
      } else {
        toast.error('Invalid email or password', {
          duration: 5000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('An error occurred. Please try again.', {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const email = document.getElementById('email').value;
    const user = usersData.find((u) => u.email === email);

    if (user) {
      toast.success('Password sent to your email!', {
        duration: 3000,
        position: 'top-center',
      });
    } else {
      toast.error('No account found with this email.', {
        duration: 5000,
        position: 'top-center',
      });
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required', 
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address',
                }
              })}
              className="w-full h-[55px] px-4 border border-[#dadada] rounded-md"
              placeholder="Enter your email"
            />
            <ErrorMessage message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
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
            <ErrorMessage message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            className="w-full h-[60px] bg-[#5f6fff] hover:bg-[#4b5ccc] text-white text-lg font-medium rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <Button
            type="button"
            onClick={handleForgotPassword}
            className="w-full mt-2 h-[50px] bg-[#f0f4ff] text-blue-500 text-sm font-medium rounded-md"
          >
            Forgot Password?
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

