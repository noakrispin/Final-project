import { api } from "./api";

export const emailAPI = {

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