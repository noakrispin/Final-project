import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Table } from "../../components/ui/Table"
import { BlurElements } from "../../components/shared/BlurElements"
import { db } from "../../firebaseConfig"
import { collection, getDocs } from "firebase/firestore"

const TABS = ["User Management", "Forms Management"]
export default function UserManagement() {
    const navigate = useNavigate()

    // Template data - will be replaced with DB fetch later
    const mockUsers = [
      {
        id: "123456789",
        fullName: "John Doe",
        email: "john@example.com",
      },
      {
        id: "987654321",
        fullName: "Jane Smith",
        email: "jane@example.com",
      },
    ]
  
    const columns = [
      {
        key: "id",
        header: "ID",
        sortable: true,
        className: "text-base",
      },
      {
        key: "fullName",
        header: "Full Name",
        sortable: true,
        className: "text-base",
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        className: "text-base",
      },
    ]
  
    return (
      <div className="relative bg-white min-h-screen overflow-hidden">
        <BlurElements />
  
        <div className="relative z-10">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center py-4">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                      tab === "User Management"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900"
                    }`}
                    onClick={() => {
                      if (tab === "Forms Management") {
                        navigate("/admin-forms")
                      }
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
  
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-gray-600 mt-2">View and manage all users in the system</p>
            </div>
  
            <Table
              data={mockUsers}
              columns={columns}
              onRowClick={(user) => {
                console.log("Selected user:", user)
              }}
              hideFilters={true}
              showFilterOptions={false}
            />
          </div>
        </div>
      </div>
    )
  }
