const { addDocument, addSubcollection } = require("./utils/firebaseHelper"); // Firebase Helper functions

const importData = async () => {
  try {
    // Create a placeholder form in the Forms collection
    const formPlaceholderData = {
      formName: "Placeholder Form",
      description: "This is a placeholder form for initialization.",
    };

    const formResponse = await addDocument("forms", "placeholderForm", formPlaceholderData);
    if (formResponse.success) {
      console.log("Forms collection initialized successfully.");

      // Add a placeholder question to the Form Questions subcollection
      const questionPlaceholderData = {
        weight: 0.0,
        title: "Placeholder Question",
        description: "This is a placeholder question.",
        response_type: "text", // 'number' or 'text'
        reference: "general", // 'general' or 'student'
        required: false,
      };

      const questionResponse = await addSubcollection(
        "forms",
        "placeholderForm",
        "questions",
        "placeholderQuestion",
        questionPlaceholderData
      );
      if (questionResponse.success) {
        console.log("Form Questions subcollection initialized successfully.");
      } else {
        console.error("Failed to initialize Form Questions subcollection:", questionResponse.error);
      }

      // Add a placeholder response to the Form Responses subcollection
      const responsePlaceholderData = {
        questionID: "placeholderQuestion",
        evaluatorID: null,
        projectCode: "placeholderProject",
        studentID: null,
        score: null,
        text_response: "Placeholder Response",
      };

      const responseAdd = await addSubcollection(
        "forms",
        "placeholderForm",
        "responses",
        "placeholderResponse",
        responsePlaceholderData
      );
      if (responseAdd.success) {
        console.log("Form Responses subcollection initialized successfully.");
      } else {
        console.error("Failed to initialize Form Responses subcollection:", responseAdd.error);
      }

      // Add a placeholder evaluation to the Form Evaluations subcollection
      const evaluationPlaceholderData = {
        evaluatorID: null,
        projectCode: "placeholderProject",
        studentID: null,
        weighted_grade: null,
      };

      const evaluationResponse = await addSubcollection(
        "forms",
        "placeholderForm",
        "evaluations",
        "placeholderEvaluation",
        evaluationPlaceholderData
      );
      if (evaluationResponse.success) {
        console.log("Form Evaluations subcollection initialized successfully.");
      } else {
        console.error("Failed to initialize Form Evaluations subcollection:", evaluationResponse.error);
      }
    } else {
      console.error("Failed to initialize Forms collection:", formResponse.error);
    }
  } catch (error) {
    console.error("Error initializing Forms collection and subcollections:", error.message);
  }
};

importData();
