import { api } from "./api";

export const emailAPI = {
  /**
   * Send reminders to all supervisors immediately.
   * @param {string|null} [message] - The custom reminder message (optional).
   */
  sendRemindersToAll: async (message = null) => {
    try {
      const response = await api.post("/users/schedule-reminders", {
        message: message || "Default reminder message for all users.",
      });

      console.log("Reminders sent successfully:", response.data);
      return response;
    } catch (error) {
      console.error(
        "Error sending reminders to all users:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error || "An error occurred while sending reminders."
      );
    }
  },

  /**
   * Notify all supervisors about a global deadline.
   * @param {string} deadline - The global deadline to notify.
   */
  notifyGlobalDeadline: async (deadline, emailMessage) => {
    try {
      console.log("Notifying supervisors of global deadline:", deadline);
      const response = await api.post("/projects/global-deadline", {
        deadline,
        emailMessage, // Include custom email message
      });
      return response;
    } catch (error) {
      console.error("Error notifying global deadline:", error.message);
      throw error;
    }
  },
};