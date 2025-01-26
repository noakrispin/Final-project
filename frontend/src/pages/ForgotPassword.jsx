import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/verify-user', { email });
      if (response.success) {
        toast.success('User verified! You can now reset your password.');
        setIsVerified(true); // Allow password reset
      } else {
        toast.error(response.message || 'User not found or invalid credentials.');
      }
    } catch (error) {
      toast.error('An error occurred during verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/reset-password', { email, newPassword }); // Only send email and new password
      if (response.success) {
        toast.success('Password successfully reset! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login'; // Navigate to login
        }, 2000); // Add a delay to allow the toast to display
      } else {
        toast.error(response.message || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error('An error occurred during password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center items-center py-12">
      {/* Background blur elements */}
      <div className="absolute top-[338px] left-[610px] w-[300px] h-[294px] bg-[#8bd8ff]/40 rounded-tl-[481.50px] rounded-tr-[600px] rounded-bl-[481.50px] rounded-br-[600px] blur-[80px]" />
      <div className="absolute bottom-0 left-[-352px] w-[1000px] h-[1018.69px] bg-[#c8d7ff]/70 rounded-[471.19px] blur-[70px]" />

      {/* Main Content */}
      <div className="w-full max-w-[562px] bg-white shadow-md border border-[#d3d3d3] rounded-[20px] relative z-10 p-8">
        <h2 className="text-[26px] font-semibold text-gray-600 mb-2">
          {isVerified ? 'Reset Password' : 'Forgot Password'}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {isVerified ? 'Set your new password below.' : 'Enter your email to verify your account.'}
        </p>

        <form onSubmit={isVerified ? handleResetPassword : handleVerifyUser} className="space-y-4">
          {!isVerified && (
            <div>
              <label htmlFor="email" className="block text-gray-600 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[55px] px-4 border border-[#dadada] rounded-md"
                placeholder="Enter your email"
              />
            </div>
          )}

          {isVerified && (
            <div>
              <label htmlFor="newPassword" className="block text-gray-600 mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                pattern=".{8,}"
                title="Password must be at least 8 characters long."
                className="w-full h-[55px] px-4 border border-[#dadada] rounded-md"
                placeholder="Enter your new password"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full h-[60px] bg-[#5f6fff] hover:bg-[#4b5ccc] text-white text-lg font-medium rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isVerified
                ? 'Resetting Password...'
                : 'Verifying User...'
              : isVerified
              ? 'Reset Password'
              : 'Verify User'}
          </button>
        </form>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default ForgotPassword;
