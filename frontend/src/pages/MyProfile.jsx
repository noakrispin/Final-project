import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/shared/ErrorMessage';

export default function MyProfile() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user] = useState(authUser);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    verifyNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    verify: false,
  });
  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount] = useState(5); // Placeholder for tasks count

  useEffect(() => {
    const fetchProjectsCount = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/approved_projects/lecturer/${user.id}`
        );
        if (response.ok) {
          const projects = await response.json();
          setProjectsCount(projects.length);
        } else {
          console.error('Failed to fetch projects count.');
        }
      } catch (error) {
        console.error('Error fetching projects count:', error);
      }
    };

    if (user.role === 'lecturer') {
      fetchProjectsCount();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswords = () => {
    const errors = {};
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (!strongPasswordRegex.test(passwordData.newPassword)) {
      errors.newPassword =
        'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'New password cannot be the same as the current password.';
    }

    if (!passwordData.verifyNewPassword) {
      errors.verifyNewPassword = 'Please confirm your new password.';
    } else if (passwordData.newPassword !== passwordData.verifyNewPassword) {
      errors.verifyNewPassword = 'Passwords do not match.';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authUser.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Password changed successfully.');
        handleCancelChangePassword();
      } else {
        setPasswordErrors({ currentPassword: result.error || 'Invalid current password.' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({ currentPassword: 'Failed to change password. Please try again.' });
    }
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', verifyNewPassword: '' });
    setShowPassword({ current: false, new: false, verify: false });
    setPasswordErrors({});
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Profile of {user.username}</h1>
            <p className="text-gray-600 font-semibold">
              {user.role} | <span className="text-blue-600 cursor-pointer">{user.email}</span>
            </p>
            {/* Change Password Button */}
            <div className="mt-4">
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="rounded border-blue-600 text-blue-600 px-3 py-1 text-sm"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Log or Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            className="p-6 bg-blue-100 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg"
            onClick={() => navigate('/projectsSupervisors')}
          >
            <h2 className="text-4xl font-extrabold text-blue-700 mb-2">{projectsCount}</h2>
            <p className="text-gray-700 font-semibold">Projects</p>
          </div>
          <div className="p-6 bg-green-100 rounded-lg shadow-md text-center hover:shadow-lg">
            <h2 className="text-4xl font-extrabold text-green-700 mb-2">{tasksCount}</h2>
            <p className="text-gray-700 font-semibold">Pending Tasks</p>
          </div>
        </div>

        {/* Password Change Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2"
                      onClick={() => toggleShowPassword('current')}
                    >
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <ErrorMessage message={passwordErrors.currentPassword} />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2"
                      onClick={() => toggleShowPassword('new')}
                    >
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <ErrorMessage message={passwordErrors.newPassword} />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Verify New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.verify ? 'text' : 'password'}
                      name="verifyNewPassword"
                      value={passwordData.verifyNewPassword}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2"
                      onClick={() => toggleShowPassword('verify')}
                    >
                      {showPassword.verify ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <ErrorMessage message={passwordErrors.verifyNewPassword} />
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-4">
                <Button
                  onClick={handleCancelChangePassword}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
