import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BlurElements } from "../../components/shared/BlurElements";
import { userApi } from "../../services/userAPI";
import UserTable from "../../components/admin/UserTable";
import LoadingScreen from "../../components/shared/LoadingScreen";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [roleFilter, setRoleFilter] = useState("All");
  const [editRoleModal, setEditRoleModal] = useState({
    isOpen: false,
    user: null,
  });
  const [editingRole, setEditingRole] = useState(""); // Used only for editing modal
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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
        if (!roleFilter || roleFilter === "All") return true; // Use roleFilter instead of selectedRole
        return user.isAdmin
          ? roleFilter === "Admin"
          : roleFilter === "Supervisor";
      });

    setFilteredUsers(updatedUsers);
  }, [users, roleFilter]); // Use roleFilter instead of selectedRole

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
    setEditingRole(user.role); // Set editingRole instead of selectedRole
  };

  // Close the edit role modal
  const closeEditRoleModal = () => {
    console.log("Closing Edit Role Modal...");
    setEditRoleModal({ isOpen: false, user: null });
    setEditingRole(""); // Reset the correct state
  };

  // Save role change
  const handleSaveRoleChange = async () => {
    if (!editRoleModal.user) {
      console.error("No user is selected for role editing.");
      return;
    }

    const userId = editRoleModal.user.emailId;
    const isAdmin = editingRole === "Admin";
    const role = "Supervisor"; // Admins retain 'Supervisor' role

    console.log(`Updating user: ${userId}, Role: ${role}, isAdmin: ${isAdmin}`);

    try {
      const response = await userApi.updateUserRole(userId, { role, isAdmin });
      if (response) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.emailId === userId ? { ...user, role, isAdmin } : user
          )
        );
        setFilteredUsers((currentFilteredUsers) =>
          currentFilteredUsers.map((user) =>
            user.emailId === userId ? { ...user, role, isAdmin } : user
          )
        );

      closeEditRoleModal();
      setTimeout(() => {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }, 300);
        console.log("User role updated successfully.");
      } else {
        console.error("Failed to update user role.");
      }
    } catch (err) {
      console.error("Error updating user role:", err.message);
      alert("An error occurred while updating the user role.");
    }
  };

  if (loading) {
    return (
      <LoadingScreen isLoading={loading} description="Looking for users..." />
    );
  }
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="relative bg-white min-h-screen">
      <BlurElements />
      {showSuccessPopup && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade">
          Role updated successfully!
        </div>
      )}
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
          <p className="text-gray-600 mt-2">
            Manage users in the system. You can promote users to Admin or delete
            them as needed.
          </p>
          <div className="mb-4 flex space-x-4">
            <select
              className="border p-2 rounded-md w-200 mt-4"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-600">
              No users match the selected role.
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onDelete={openDeleteModal}
              onEditRole={openEditRoleModal} // Pass the role editing function
            />
          )}
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete{" "}
              {deleteModal.user?.fullName || "this user"}?
            </p>
            <div className="flex justify-end mt-4 space-x-2">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Role</h2>
            <p>Change Role for {editRoleModal.user?.fullName}:</p>
            <select
              className="border p-2 rounded-md w-full mt-4"
              value={editingRole}
              onChange={(e) => setEditingRole(e.target.value)}
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
