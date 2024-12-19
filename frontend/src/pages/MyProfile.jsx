import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MyProfile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data dynamically based on authUser
    if (authUser) {
      setUser({
        fullName: authUser.fullName || 'Dr. Unknown',
        email: authUser.email || 'unknown@example.com',
        role: authUser.role || 'lecturer',
        projects: authUser.projects || 0, // Total projects being supervised
        pendingReviews: authUser.pendingReviews || 0, // Total reviews pending
      });
    }
  }, [authUser]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f9fafc] p-8">
      <div className="w-full bg-white shadow-lg rounded-lg p-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{`${user.fullName}'s Profile`}</h1>
          <p className="text-gray-500 text-lg">
            {`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} | `}
            <a href={`mailto:${user.email}`} className="text-blue-600 underline">
              {user.email}
            </a>
          </p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
            Change Password
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 gap-6">
          {/* Projects Card */}
          <Link
            to="/ProjectsSupervisors"
            className="block bg-blue-100 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-blue-600">{user.projects}</h2>
            <p className="text-gray-600 text-lg">Total Projects Supervised</p>
          </Link>

          {/* Pending Reviews Card */}
          <Link
            to="/ProjectToReview"
            className="block bg-green-100 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-green-600">{user.pendingReviews}</h2>
            <p className="text-gray-600 text-lg">Pending Reviews</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
