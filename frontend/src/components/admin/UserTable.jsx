import React from "react";
import PropTypes from "prop-types";
import { Table } from "../ui/Table";
import { Card } from "../ui/Card";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

const UserTable = ({ users, onDelete, onEditRole }) => {
  console.log("Users passed to UserTable:", users);

  const userColumns = [
    { key: "id", header: "ID", sortable: true },
    { key: "fullName", header: "Full Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (value, user) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-700"
            onClick={() => onEditRole(user)} // Pass user to onEditRole
          >
            <FaRegEdit />
          </button>
          <button
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(user)}
          >
            <MdDeleteForever />
          </button>
        </div>
      ),
    },
  ];

  if (!users || users.length === 0) {
    console.error("No valid user data provided to UserTable:", users);
    return <div>No users available</div>;
  }

  return (
    <Card className="p-6">
      <Table
        data={users}
        columns={userColumns}
        showTabs={false}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </Card>
  );
};

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEditRole: PropTypes.func.isRequired, // Ensure onEditRole is defined as required
};

export default UserTable;
