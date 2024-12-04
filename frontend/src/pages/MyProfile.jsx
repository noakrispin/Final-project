import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, LogOut, User, FileText, SwitchCamera, Edit, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import mockUsers from '../data/mockUsers.json'

export default function MyProfile() {
  const { user: authUser, logout } = useAuth()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [editedUser, setEditedUser] = useState(null)

  useEffect(() => {
    // Simulate fetching user data from API
    const fetchUser = async () => {
      const foundUser = mockUsers.find(u => u.id === authUser.id)
      setUser(foundUser)
      setEditedUser(foundUser)
    }

    if (authUser) {
      fetchUser()
    }
  }, [authUser])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    setUser(editedUser)
    // In a real app, you would send this data to your backend
    console.log('Saving user data:', editedUser)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedUser(user)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedUser(prev => ({ ...prev, [name]: value }))
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Images */}
          <div className="flex items-start gap-8">
            <div className="relative">
              <img
                src="https://via.placeholder.com/160x160"
                alt="Profile"
                className="w-40 h-40 rounded-lg object-cover"
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg">
                  <SwitchCamera className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
            <div className="w-40 h-40 bg-[#eeeaff] rounded-lg flex items-center justify-center">
              <div className="w-[87px] h-[87px] bg-[#d5d9ff] rounded-full" />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-[32px] font-medium text-gray-800">
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={editedUser.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              user.fullName
            )}
          </h1>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="border-t border-[#adadad] pt-4">
              <h2 className="text-[#797979] text-base font-normal underline mb-4">
                CONTACT INFORMATION
              </h2>
              <div className="space-y-4">
                <div className="flex">
                  <span className="w-32 text-gray-600 text-lg">Email:</span>
                  <span className="text-[#3c95ff] text-lg">
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      user.email
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600 text-lg">Role:</span>
                  <span className="text-gray-500 text-lg">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="rounded-full border-[#5f6fff] text-gray-600 px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save information
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="rounded-full border-[#5f6fff] text-gray-600 px-8"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                variant="outline"
                className="rounded-full border-[#5f6fff] text-gray-600 px-8"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Project Info */}
        <div className="space-y-8">
          {/* Project Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-[32px] font-medium text-gray-800 mb-8">My Project</h2>
            <div className="space-y-4">
              <div className="flex">
                <span className="w-32 text-gray-600 text-lg">Project Name:</span>
                <span className="text-gray-500 text-lg">Sample Project</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600 text-lg">Supervisor:</span>
                <span className="text-gray-500 text-lg">Dr. Example</span>
              </div>
              <Link
                to="/project-details"
                className="inline-block text-gray-600 text-lg underline mt-4"
              >
                View Project Details
              </Link>
            </div>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2"
            >
              <img
                src="https://via.placeholder.com/49x49"
                alt="Profile"
                className="w-[49px] h-[49px] rounded-full"
              />
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
                <Link
                  to="/status"
                  className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Status
                </Link>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <SwitchCamera className="w-4 h-4 mr-2" />
                  Switch Role
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}