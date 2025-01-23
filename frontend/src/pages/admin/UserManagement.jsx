import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BlurElements } from "../../components/shared/BlurElements";
import { userApi } from "../../services/userAPI";
import UserTable from "../../components/admin/UserTable";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [editRoleModal, setEditRoleModal] = useState({ isOpen: false, user: null });
  const [selectedRole, setSelectedRole] = useState(""); // State for the selected role

  const tabs = ["User Management", "Forms Management"];
  const [activeTab, setActiveTab] = useState("User Management");

  // Fetch users from the API on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAllUsers();
        console.log("Fetched users:", response);
        setUsers(response || []);
        setFilteredUsers(response || []); // Initially show all users
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  // Filter users whenever `users` or `roleFilter` changes
  useEffect(() => {
    const updatedUsers = users
      .filter((user) => user && user.emailId) // Ensure valid users
      .filter((user) => {
        if (roleFilter === "All") return true; // No filtering for "All"
        return user.role === roleFilter; // Filter by role
      });
    setFilteredUsers(updatedUsers);
  }, [users, roleFilter]);

  // Open the delete modal
  const openDeleteModal = (user) => {
    if (!user || typeof user !== "object") {
      console.error("Invalid user passed to openDeleteModal:", user);
      return;
    }
    setDeleteModal({ isOpen: true, user });
  };

  // Close the delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deleteModal.user) {
      console.error("No user is selected for deletion.");
      return;
    }

    const userId = deleteModal.user.emailId;
    console.log(`Deleting user with email: ${userId}`);

    try {
      const response = await userApi.deleteUser(userId);
      if (response) {
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.emailId !== userId)
        );
        closeDeleteModal();
        console.log("User deleted successfully.");
      } else {
        console.error("Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err.message);
      alert("An error occurred while deleting the user.");
    }
  };

  // Open the edit role modal
  const openEditRoleModal = (user) => {
    if (!user || typeof user !== "object") {
      console.error("Invalid user passed to openEditRoleModal:", user);
      return;
    }
    setEditRoleModal({ isOpen: true, user });
    setSelectedRole(user.role); // Initialize with the current role
  };

  // Close the edit role modal
  const closeEditRoleModal = () => {
    console.log("Closing Edit Role Modal...");
    setEditRoleModal({ isOpen: false, user: null });
    setSelectedRole(""); // Reset selected role
  };

  // Save role change
  const handleSaveRoleChange = async () => {
    if (!editRoleModal.user) {
      console.error("No user is selected for role editing.");
      return;
    }
  
    const userId = editRoleModal.user.emailId;
    const isAdmin = selectedRole === "Admin"; // Check if Admin is selected
    const role = "Supervisor"; // Admins retain 'Supervisor' as their role
  
    console.log(`Updating user: email: ${userId}, Role: ${role}, isAdmin: ${isAdmin}`);
  
    try {
      const response = await userApi.updateUserRole(userId, { role, isAdmin });
      if (response) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.emailId=== userId ? { ...user, role, isAdmin } : user
          )
        );
        setFilteredUsers((currentFilteredUsers) =>
          currentFilteredUsers.map((user) =>
            user.emailId === userId ? { ...user, role, isAdmin } : user
          )
        );
        closeEditRoleModal();
        console.log("User role and isAdmin status updated successfully.");
      } else {
        console.error("Failed to update user role.");
      }
    } catch (err) {
      console.error("Error updating user role:", err.message);
      alert("An error occurred while updating the user role.");
    }
  };
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="relative bg-white min-h-screen">
      <BlurElements />
      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900"
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "Forms Management") {
                      navigate("/admin-forms");
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeTab === "User Management" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <div className="mb-4 flex space-x-4">
          <select
            className="border p-2 rounded-md w-full mt-4"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
          </select>
          </div>
          <UserTable
            users={filteredUsers}
            onDelete={openDeleteModal}
            onEditRole={openEditRoleModal} // Pass the role editing function
          />
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete{" "}
              {deleteModal.user?.fullName || "this user"}?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editRoleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Role</h2>
            <p>Change the role for {editRoleModal.user?.fullName}:</p>
            <select
              className="border p-2 rounded-md w-full mt-4"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
            </select>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeEditRoleModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoleChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
