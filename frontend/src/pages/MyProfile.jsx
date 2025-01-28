import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../services/projectsAPI";
import { userApi } from "../services/userAPI";
import { evaluatorsApi } from "../services/evaluatorsAPI";
import LoadingScreen from "../components/shared/LoadingScreen";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";

export default function MyProfile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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
        const fetchedUser = await userApi.getUser(authUser.email);
        setUser(fetchedUser);
        if (fetchedUser) {
          setEditedName(fetchedUser.fullName || ""); // Initialize with user's current name
        }

        // Fetch all projects
        const projectsData = await projectsApi.getAllProjects();

        // Count supervised projects
        const supervisedCount = projectsData.filter(
          (project) =>
            project.supervisor1 === authUser.email ||
            project.supervisor2 === authUser.email
        ).length;
        setSupervisedProjectsCount(supervisedCount);

        // Fetch evaluator data for pending reviews
        const evaluatorsResponse = await evaluatorsApi.getProjectsByEvaluator(
          authUser.email
        );
        console.log("evaluatorsResponse:", evaluatorsResponse);
        const pendingReviews = evaluatorsResponse.filter(
          (evaluator) => evaluator.status === "Not Submitted"
        );
        console.log("pendingReviews", pendingReviews);
        setPendingReviewsCount(pendingReviews.length);
      } catch (err) {
        console.error("Error fetching profile or projects:", err.message);
        setError("Unable to fetch profile or projects data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndProjects();
  }, [authUser]);

  if (loading) {
    return (
      <LoadingScreen
        isLoading={loading}
        description="Preparing your profile..."
      />
    );
  }
  if (error) return <div>Error: {error}</div>;

  if (!user) {
    return (
      <div>
        <p>No user data found. Please log in again.</p>
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 underline"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleNameUpdate = async () => {
    if (!editedName.trim() || editedName === user.fullName) {
      setIsEditing(false);
      return;
    }
  
    try {
      const response = await userApi.updateUserRole(user.email, { fullName: editedName });
      console.log("response updateUserRole:", response);
      if (response.success) {
        setUser((prevUser) => ({ ...prevUser, fullName: editedName }));
        setIsEditing(false);
      } else {
        throw new Error("Update failed.");
      }
    } catch (error) {
      console.error("Failed to update name:", error.message);
      alert("Failed to update name. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-[#f9fafc] p-8">
      <div className="w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  className="text-3xl font-bold text-gray-800 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleNameUpdate}
                  className="text-green-600 hover:text-green-800 text-xl"
                >
                  <FaCheck /> {/* Save Button */}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-red-600 hover:text-red-800 text-xl"
                >
                  <FaTimes /> {/* Cancel Button */}
                </button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-900">{`${user.fullName}'s Profile`}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 text-xl"
                >
                  <FaEdit /> {/* Edit Button */}
                </button>
              </>
            )}
          </div>

          {/* Role & Email */}
          <div className="flex flex-col sm:flex-row items-center justify-center text-gray-500 text-lg mt-1">
            <span className="font-medium">
              {user.isAdmin ? "Admin" : user.role}
            </span>
            <span className="hidden sm:inline mx-2">|</span>
            <a
              href={`mailto:${user.email}`}
              className="text-blue-600 underline"
            >
              {user.email}
            </a>
          </div>
          {/* Change Password */}
          <button
            onClick={() => navigate("/forgot-password")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow hover:shadow-md"
          >
            Change Password
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Total Projects Supervised */}
          <button
            onClick={() => navigate("/projectsSupervisors")}
            className="block bg-blue-100 hover:bg-blue-200 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-blue-600">
              {supervisedProjectsCount}
            </h2>
            <p className="text-gray-600 text-lg">Total Projects Supervised</p>
          </button>

          {/* Pending Reviews */}
          <button
            onClick={() =>
              navigate(
                supervisedProjectsCount > 0
                  ? "/MyProjectsReview"
                  : "/OtherProjectsReview"
              )
            }
            className="block bg-green-100 hover:bg-green-200 text-center p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-4xl font-bold text-green-600">
              {pendingReviewsCount}
            </h2>
            <p className="text-gray-600 text-lg">Pending Reviews</p>
          </button>
        </div>

        {/* Admin Dashboard Button */}
        {user.isAdmin && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/admin-projects")}
              className="block bg-yellow-100 hover:bg-yellow-200 text-center p-3 rounded-lg shadow hover:shadow-md transition-shadow text-lg"
            >
              <h2 className="text-3xl font-bold text-yellow-600">
                Go to Admin Mode
              </h2>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
