import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import UnifiedFormComponent from "./UnifiedFormComponent";
import EditFormComponent from "./EditFormComponent";
import { formsApi } from "../../services/formAPI";
import LoadingScreen from "../../components/shared/LoadingScreen";

/**
 * This component dynamically renders a form page based on the provided query parameters.
 * It fetches form details and questions from the API and displays either an editable form or a unified form view.
 */
const DynamicFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Extract query parameters
  const formID = searchParams.get("formID");
  const source = searchParams.get("source");
  const projectCode = searchParams.get("projectCode");
  const projectName = searchParams.get("projectName");
  // const readOnly = searchParams.get("readOnly") === "true";
  const students = JSON.parse(searchParams.get("students") || "[]");

  // State variables for form details, questions, loading state, and error message
  const [formDetails, setFormDetails] = useState({
    title: "Loading...",
    description: "",
  });
  const [formQuestions, setFormQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Fetches form details and questions from the API.
   * This effect runs when the component mounts and whenever formID or user changes.
   */
  useEffect(() => {
    const fetchFormDetailsAndQuestions = async () => {
      if (!formID || !user || user.role !== "Supervisor") return;

      try {
        console.log("Fetching form metadata and questions for formID:", formID);

        // Combine API requests to prevent multiple calls
        const [formMetadata, questions] = await Promise.all([
          formsApi.getForm(formID),
          formsApi.getQuestions(formID),
        ]);

        setFormDetails({
          title: formMetadata.formName || "Form Title",
          description: formMetadata.description || "Form Description",
        });
        setFormQuestions(questions);
      } catch (err) {
        console.error("Error fetching form details and questions:", err);
        setError(err.message || "An error occurred while loading the form.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetailsAndQuestions();
  }, [formID, user]);

  // Display loading screen while fetching data
  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} description="Loading form..." />;
  }

  // Display error message if data fetching fails
  if (error) {
    return (
      <div className="text-center mt-6 text-red-500">
        {error || "Failed to load form. Please try again later."}
      </div>
    );
  }

  console.log("Form Details:", formDetails); // Debug log for form details
  console.log("Form Questions:", formQuestions); // Debug log for questions

  // Render the appropriate form component based on the source parameter
  //for admin we render EditFormComponent and for supervisor we render UnifiedFormComponent 
  if (source === "admin") {
    return (
      <EditFormComponent
        formID={formID}
        formTitle={formDetails.title || ""}
        formDescription={formDetails.description || ""}
        questions={formQuestions}
      />
    );
  } else {
    return (
      <UnifiedFormComponent
        formID={formID}
        formTitle={formDetails.title || ""}
        formDescription={formDetails.description || ""}
        questions={formQuestions}
        projectCode={projectCode}
        projectName={projectName}
        students={students}
        // readOnly={readOnly}
      />
    );
  }
};

export default DynamicFormPage;
