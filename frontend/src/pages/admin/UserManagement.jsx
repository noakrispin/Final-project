import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { userApi } from "../../services/userAPI";

const TABS = ["All Users", "Administrators", "Students"];

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await userApi.getAllUsers();
        console.log("Fetched users:", fetchedUsers);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (activeTab === "All Users") return true;
    if (activeTab === "Administrators") return user.role === "Admin";
    if (activeTab === "Students") return user.role === "Student";
    return true;
  });

  const userColumns = [
    {
      key: "id",
      header: "User ID",
      sortable: true,
    },
    {
      key: "fullName",
      header: "Full Name",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => console.log("Clicked user:", row)}
          className="text-blue-600 hover:text-blue-800"
        >
          {value || "Unknown"}
        </button>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value, row) => (
        <span
          className={`px-2 py-1 rounded-full ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value || "Unknown"}
        </span>
      ),
    },
  ];

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex justify-center mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-lg font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div>
        <Table columns={userColumns} data={filteredUsers} showTabs={false} />
      </div>
    </div>
  );
};

export default UserManagement;
