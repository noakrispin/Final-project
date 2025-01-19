// utils/dateUtils.js
export const formatDate = (date) => {
    if (!date) return "No date available";
  
    // Handle Firestore Timestamps
    if (date._seconds && date._nanoseconds) {
      return new Date(date._seconds * 1000).toLocaleDateString();
    }
  
    // Handle Firestore `toDate()` and native JavaScript Date
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
  
    // Handle string or raw Date object
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? "Invalid Date" : parsedDate.toLocaleDateString();
  };
  