import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast'; // Import Toaster
import { api } from '../services/api'; // Your API service

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/verify-user', { email, id });
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
      const response = await api.post('/auth/reset-password', { email, id, newPassword });
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      {/* Toast notifications */}
      <Toaster /> {/* Mount the toaster here */}

      <form
        className="bg-white p-6 shadow-md rounded"
        onSubmit={isVerified ? handleResetPassword : handleVerifyUser}
      >
        <h2 className="text-lg font-semibold mb-4">
          {isVerified ? 'Reset Password' : 'Forgot Password'}
        </h2>

        {!isVerified && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="text"
              placeholder="Enter your ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="w-full p-2 border rounded mb-4"
            />
          </>
        )}

        {isVerified && (
          <>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              pattern=".{8,}"
              title="Password must be at least 8 characters long."
              className="w-full p-2 border rounded mb-4"
            />
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
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
  );
}

export default ForgotPassword;
