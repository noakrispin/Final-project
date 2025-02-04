/**
 * This component renders a table of users with functionalities to edit roles and delete users.
 * 
 * Props:
 * - users: Array of user objects to display.
 * - onDelete: Function to handle deleting a user.
 * - onEditRole: Function to handle editing a user's role.
 */
import React from "react";
import PropTypes from "prop-types";
import { Table } from "../ui/Table";
import { Card } from "../ui/Card";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

const UserTable = ({ users, onDelete, onEditRole }) => {
  console.log("Users passed to UserTable:", users);

  const userColumns = [
    { key: "fullName", header: "Full Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "role",
      header: "Role",
      render: (value, user) => (user.isAdmin === true ? "Admin" : "Supervisor"), // Display role
      sortable: true, // Enable sorting
      sortAccessor: (user) => (user.isAdmin === true ? "Admin" : "Supervisor"), // Sort by role
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, user) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-700"
            onClick={() => onEditRole(user)} // Pass user to onEditRole
            aria-label="Edit Role"
            title="Edit Role"
          >
            <FaRegEdit />
          </button>
          <button
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(user)}
            aria-label="Delete User"
            title="Delete User"
          >
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  if (!users || users.length === 0) {
    console.error("No valid user data provided to UserTable:", users);
    return (
      <div className="text-center text-gray-600">
        No users available. Add new users to get started.
      </div>
    );
  }

  return (
    <Card className="p-6">
      <Table
        data={users}
        columns={userColumns}
        showTabs={false}
        onRowClick={(row) => console.log("Row clicked:", row)}
        showDescription={true}
        description="Click the Edit icon to assign or modify a user's role, or click Delete to remove the user from the system."
      />
    </Card>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      fullName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      isAdmin: PropTypes.bool, // Explicitly expect boolean for isAdmin
      role: PropTypes.string,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEditRole: PropTypes.func.isRequired,
};

export default UserTable;
