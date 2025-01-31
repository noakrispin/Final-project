import { api } from "./api";

export const emailAPI = {

  sendRemindersToEvaluators: async (message = null) => {
    try {
      const response = await api.post("/evaluators/schedule-reminders", {
        message, // Default message will be handled in the backend if null
      });
  
      console.log("Reminders sent successfully:", response.data);
      return response;
    } catch (error) {
      console.error(
        "Error sending reminders to pending evaluators:",
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