import { api } from "./api";

export const emailAPI = {
  /**
   * Sends reminders to evaluators who didnt submitted grade to project.
   *
   * This function sends a request to the backend to schedule reminders for evaluators.
   * An optional message can be included in the request.
   *
   * @param {string|null} message - The message to include in the reminder email.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  sendRemindersToEvaluators: async (message = null) => {
    try {
      console.log("Sending request to backend for reminders with message:", message);
      
      const response = await api.post("/evaluators/schedule-reminders", {
        message,
      });
  
      console.log("Reminders sent successfully:", response);
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
   *
   * This function sends a request to the backend to notify all supervisors about a global deadline.
   * It includes the deadline, a custom email message, and a list of supervisor emails in the request.
   *
   * @param {string} deadline - The global deadline to notify supervisors about.
   * @param {string} emailMessage - The custom email message to include in the notification.
   * @param {Array<string>} supervisorEmails - The list of supervisor emails to notify.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  notifyGlobalDeadline: async (deadline, emailMessage, supervisorEmails) => {
    try {
      console.log("Notifying supervisors of global deadline:", deadline);
      // Include the supervisorEmails in the payload
      const response = await api.post("/projects/global-deadline", {
        deadline,
        emailMessage, // Include custom email message
        supervisorEmails, // list of unique supervisor emails
      });
      return response;
    } catch (error) {
      console.error("Error notifying global deadline:", error.message);
      throw error;
    }
  },
};