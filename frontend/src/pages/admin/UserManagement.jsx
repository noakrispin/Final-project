import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { BlurElements } from "../../components/shared/BlurElements";
import { api } from "../../services/api";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  
  // Tabs configuration
  const tabs = ["User Management", "Forms Management"];
  const [activeTab, setActiveTab] = useState("User Management");

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
    setFilteredUsers(updatedUsers.filter((user) => user && user.id));
  }, [searchTerm, roleFilter, users]);

  const handleRowClick = (user) => {
    if (!user) {
      console.error("No user data available for row click.");
      return;
    }
    console.log("Row clicked:", user);
  };

  const columns = [
    { key: "id", header: "ID", sortable: true },
    { key: "fullName", header: "Full Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <button
          className="text-red-600 hover:underline"
          onClick={() => console.log("Delete user:", user)}
        >
          Delete
        </button>
      ),
    },
  ];

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
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
