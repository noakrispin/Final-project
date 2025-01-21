import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { BlurElements } from "../../components/shared/BlurElements";
import { api } from "../../services/api";

// Delete Confirmation Modal Component
// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-96">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h2 className="text-lg font-bold">Confirm Deletion</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            <p>Are you sure you want to delete {userName}?</p>
          </div>
          <div className="flex justify-end px-4 py-2 border-t">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("Delete button clicked"); // Debugging log
                onConfirm();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
};
  

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  // Ensure valid user data
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users");
        if (response.success) {
          setUsers(response.data || []);
          setFilteredUsers(response.data || []);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    let updatedUsers = users;
  
    if (roleFilter !== "All") {
      updatedUsers = updatedUsers.filter(
        (user) => user && user.role === roleFilter
      );
    }
  
    if (searchTerm) {
      updatedUsers = updatedUsers.filter(
        (user) =>
          user &&
          (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  
    setFilteredUsers(updatedUsers.filter((user) => user && user.id)); // Ensure valid users
  }, [searchTerm, roleFilter, users]);

  const openDeleteModal = (user) => {
    if (!user) {
      console.error("No user passed to openDeleteModal.");
      return;
    }
    console.log("Opening delete modal for user:", user); // Correct log
    setDeleteModal({ isOpen: true, user });
  };

  

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };
  const handleDeleteUser = async () => {
    if (!deleteModal.user) {
      console.error("No user selected for deletion.");
      return;
    }
  
    console.log("Deleting user:", deleteModal.user); // Debugging log
  
    try {
      const response = await api.delete(`/users/${deleteModal.user.id}`); // Assuming user ID is correct
      console.log("API Response:", response);
  
      if (response.success) {
        // Update local state to remove the deleted user
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id !== deleteModal.user.id)
        );
        closeDeleteModal();
        console.log("User deleted successfully.");
      } else {
        console.error("Failed to delete user:", response.message);
      }
    } catch (err) {
      console.error("Error deleting user:", err.message);
    }
  };


  const handleRowClick = (user) => {
    if (!user) {
      console.error("No user data available for row click.");
      return;
    }
    console.log("Row clicked:", user);
  };

  const columns = [
    { key: "id", header: "ID", sortable: true, className: "text-base" },
    { key: "fullName", header: "Full Name", sortable: true, className: "text-base" },
    { key: "email", header: "Email", sortable: true, className: "text-base" },
    { key: "role", header: "Role", sortable: true, className: "text-base" },
    {
      key: "actions",
      header: "Actions",
      className: "text-base",
      render: (user) => (
        <div className="flex space-x-2">
          <button
            className="text-red-600 hover:underline"
            onClick={() => openDeleteModal(user)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              <button
                className="inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium border-blue-900 text-blue-900"
                onClick={() => navigate("/admin-forms")}
              >
                Manage Forms
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-2">
              View and manage all users in the system
            </p>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="border p-2 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border p-2 rounded-md"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          <Table
            data={filteredUsers}
            columns={columns}
            onRowClick={(user) => handleRowClick(user)} // Adapts to existing Table logic
            hideFilters={true}
            showFilterOptions={false}
            showTabs={false}
          />
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        userName={deleteModal.user?.fullName || "this user"}
      />
    </div>
  );
};

export default UserManagement;
