const bcrypt = require("bcrypt");
const { addDocument, addSubcollection } = require("./utils/firebaseHelper"); // Firebase Helper functions

const importData = async () => {
  try {
    // Add a placeholder document to initialize the collection
    const placeholderData = {
      projectCode: "placeholder", // Unique placeholder ID
      title: "",
      description: "",
      part: "",
      type: "",
      student1Name: "",
      student1Id: "",
      student1Email: "",
      student2Name: "",
      student2Id: "",
      student2Email: "",
      supervisor1Name: "",
      supervisor1Id: "",
      supervisor2Name: "",
      supervisor2Id: "",
      gitLink: "",
      deadline: "",
      specialNotes: "",
    };

    const response = await addDocument("projects", "placeholder", placeholderData);
    if (response.success) {
      console.log("Projects table initialized successfully.");
    } else {
      console.error("Failed to initialize Projects table:", response.error);
    }
  } catch (error) {
    console.error("Error initializing Projects table:", error.message);
  }
};

importData();
