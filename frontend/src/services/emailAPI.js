import { api } from "./api";

export const emailAPI = {
  /**
   * Send reminders to all supervisors.
   * @param {Array<string>} supervisorEmails - The emails of all supervisors.
   * @param {string|null} [scheduleDate] - The date to schedule reminders (optional).
   * @param {string|null} [message] - The custom reminder message (optional).
   */
  sendRemindersToAll: async (supervisorEmails, scheduleDate = null, message = null) => {
    try {
      // Input validation
      if (!supervisorEmails || supervisorEmails.length === 0) {
        throw new Error("Supervisor emails are required to send reminders.");
      }

      const payload = { supervisorEmails, scheduleDate };
      if (message) {
        payload.message = message; // Include only if provided
      }

      console.log("Sending reminders to all supervisors:", JSON.stringify(payload, null, 2));

      const response = await api.post("/schedule-reminders-to-all", {
        supervisorEmails,
        scheduleDate,
        message,
      });

      console.log("Reminders sent successfully:", response.data);

      return response;
    } catch (error) {
      console.error(
        "Error sending reminders to all supervisors:",
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