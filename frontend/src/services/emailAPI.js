import { api } from "./api";

export const emailAPI = {
  /**
   * Send reminders to all supervisors.
   * @param {Array<string>} supervisorEmails - The emails of all supervisors.
   * @param {string|null} [scheduleDate] - The date to schedule reminders (optional).
   * @param {string|null} [message] - The custom reminder message (optional).
   */
  sendRemindersToAll: async (scheduleDateTime, message = null) => {
    try {
      if (!scheduleDateTime) {
        throw new Error("Schedule date and time are required to send reminders.");
      }

      const response = await api.post("/users/schedule-reminders", {
        scheduleDateTime, // Pass the combined date and time
        message, // Optional custom message
      });

      console.log("Reminders scheduled successfully:", response.data);
      return response;
    } catch (error) {
      console.error(
        "Error sending reminders to all users:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error || "An error occurred while scheduling reminders."
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