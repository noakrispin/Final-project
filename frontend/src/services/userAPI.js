import { api } from "./api"; // Import the shared API utilities

export const userApi = {
  /**
   * Add a new user to the database.
   * @param {object} userData - The user details (id, fullName, email, role, password, supervisorTopics).
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
   * @param {string} userId - The ID of the user to fetch.
   */
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      console.log("API Response for getUser:", response.data);
  
      // Ensure we check if the required data exists, fallback otherwise
      if (response.data && response.data.id && response.data.fullName) {
        return {
          fullName: response.data.fullName, // Correct extraction
          role: response.data.role,
          email: response.data.email || null,
          isAdmin: response.data.isAdmin || false, // Explicitly include isAdmin
          supervisorDetails: response.data.supervisorDetails || null,
          adminDetails: response.data.adminDetails || null,
        };
      } else {
        throw new Error(`User data is incomplete or missing for ID: ${userId}`);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error(`Failed to fetch user with ID: ${userId}`);
    }
  },

  /**
   * Fetch all users from the database.
   */
  getAllUsers: async () => {
    try {
      console.log("Fetching all users from API...");
      const response = await api.get("/users");
      console.log("Users fetched successfully(userAPI):", response.data);
      return response.data || []; 
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete a user by ID from the database.
   * @param {string} userId - The ID of the user to delete.
   */
  deleteUser: async (userId) => {
    try {
      console.log(`Sending DELETE request for user ID: ${userId}`); // Debugging log
      const response = await api.delete(`/users/${userId}`);
      console.log("API Response for deleteUser:", response);
      return response; // Return the API response
    } catch (error) {
      console.error("Error deleting user:", error.message);
      throw new Error(`Failed to delete user with ID: ${userId}`);
    }
  },


    /**
     * Update the role of a user in the database.
     * @param {string} userId - The ID of the user to update.
     * @param {boolean} isAdmin - Whether the user should be an admin.
     */
    updateUserRole: async (userId, { role, isAdmin }) => {
      try {
        console.log(
          `Sending PUT request to update user ID: ${userId} with role: ${role}, isAdmin: ${isAdmin}`
        );
        const response = await api.put(`/users/${userId}/role`, { role, isAdmin });
        console.log("API Response for updateUserRole:", response);
        return response.data;
      } catch (error) {
        console.error("Error updating user role:", error.response?.data || error.message);
        throw new Error(`Failed to update role for user with ID: ${userId}`);
      }
    },
};
