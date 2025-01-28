import { api } from "./api"; // Import the shared API utilities

export const userApi = {
  /**
   * Add a new user to the database.
   * @param {object} userData - The user details (emailId, fullName, email, role, password, supervisorTopics).
   */
  addUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },

  /**
   * Fetch a user's details along with subcollections.
   * @param {string} emailId - The email of the user to fetch.
   */
  getUser: async (emailId) => {
    try {
      const response = await api.get(`/users/${emailId}`);
      console.log("API Response for getUser:", response.data);

      // Ensure we check if the required data exists, fallback otherwise
      if (response.data && response.data.emailId && response.data.fullName) {
        return {
          fullName: response.data.fullName, // Correct extraction
          role: response.data.role,
          email: response.data.email || null,
          isAdmin: response.data.isAdmin || false, // Explicitly include isAdmin
          supervisorDetails: response.data.supervisorDetails || null,
          adminDetails: response.data.adminDetails || null,
        };
      } else {
        throw new Error(`User data is incomplete or missing for email: ${emailId}`);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error(`Failed to fetch user with email: ${emailId}`);
    }
  },

  /**
   * Fetch all users from the database.
   */
  getAllUsers: async () => {
    try {
      console.log("Fetching all users from API...");
      const response = await api.get("/users");
      console.log("Users fetched successfully (userAPI):", response.data);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete a user by emailId from the database.
   * @param {string} emailId - The email of the user to delete.
   */
  deleteUser: async (emailId) => {
    try {
      console.log(`Sending DELETE request for user emailId: ${emailId}`); // Debugging log
      const response = await api.delete(`/users/${emailId}`);
      console.log("API Response for deleteUser:", response);
      return response; // Return the API response
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw new Error(`Failed to delete user with email: ${emailId}`);
    }
  },

  /**
   * Update the role of a user in the database.
   * @param {string} emailId - The email of the user to update.
   * @param {object} roleData - Object containing the role and isAdmin status.
   */
  updateUserRole: async (emailId, { role, isAdmin, fullName }) => {
    try {
        console.log(
            `Sending PUT request to update user emailId: ${emailId} with role: ${role}, isAdmin: ${isAdmin}, fullName: ${fullName}`
        );

        // Only include properties that are actually defined
        const updateData = {};
        if (role !== undefined) updateData.role = role;
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
        if (fullName) updateData.fullName = fullName;

        // Send the update request
        const response = await api.put(`/users/${emailId}/role`, updateData);
        console.log("API Response for updateUserRole:", response);
        
        return response;
    } catch (error) {
        console.error("Error updating user role:", error.response?.data || error.message);
        throw new Error(`Failed to update user with email: ${emailId}`);
    }
},

};
