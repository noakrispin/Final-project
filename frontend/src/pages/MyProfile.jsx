import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { projectsApi } from "../services/projectsAPI";

export default function MyProfile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [supervisedProjectsCount, setSupervisedProjectsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user details
        const userResponse = await api.get(`/users/${authUser.id}`);
        if (userResponse.success) {
          setUser(userResponse.data);
        } else {
          setError("Failed to load profile data.");
          return;
        }

        // Fetch all projects
        const projectsData = await projectsApi.getAllProjects();

        // Count supervised projects
        const supervisedCount = projectsData.filter(
          (project) =>
            project.supervisor1 === authUser.id || project.supervisor2 === authUser.id
        ).length;
        setSupervisedProjectsCount(supervisedCount);

        // Fetch evaluator projects for pending reviews
        const evaluatorsResponse = await api.get(`/evaluators/projects/${authUser.id}`);
        if (evaluatorsResponse.success) {
          console.log("Evaluator Projects:", evaluatorsResponse.data); // Debugging log
          const pendingReviews = evaluatorsResponse.data.filter(
            (project) => project.status == "Not Submitted"
          );
          console.log("Pending Reviews Count:", pendingReviews.length); // Debugging log
          setPendingReviewsCount(pendingReviews.length);
        } else {
          console.error("Failed to load evaluator projects.");
        }
      } catch (err) {
        console.error("Error fetching profile or projects:", err.message);
        setError("Unable to fetch profile or projects data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProjects();
  }, [authUser]);

  if (loading) return <div>Loading your profile...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!user) {
    return (
      <div>
        <p>No user data found. Please log in again.</p>
        <button onClick={() => navigate("/login")} className="text-blue-600 underline">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafc] p-8">
      <div className="w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            {`${user.fullName}'s Profile`}
          </h1>
          <p className="text-gray-500 text-lg">
            {user.role && `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} | `}
            <a href={`mailto:${user.email}`} className="text-blue-600 underline">
              {user.email}
            </a>
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Total Projects Supervised */}
          <button
            onClick={() => navigate("/projectsSupervisors")}
            className="block bg-blue-100 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-blue-600">{supervisedProjectsCount}</h2>
            <p className="text-gray-600 text-lg">Total Projects Supervised</p>
          </button>

          {/* Pending Reviews */}
          <button
            onClick={() => navigate("/MyProjectsReview")}
            className="block bg-green-100 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-green-600">{pendingReviewsCount}</h2>
            <p className="text-gray-600 text-lg">Pending Reviews</p>
          </button>
        </div>
      </div>
    </div>
  );
}
