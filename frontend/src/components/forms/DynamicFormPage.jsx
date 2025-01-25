import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import UnifiedFormComponent from "./UnifiedFormComponent";
import EditFormComponent from "./EditFormComponent";
import { formsApi } from "../../services/formAPI";

const DynamicFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const formID = searchParams.get("formID");
  const source = searchParams.get("source");
  const projectCode = searchParams.get("projectCode");
  const projectName = searchParams.get("projectName");
  const readOnly = searchParams.get("readOnly") === "true";
  const students = JSON.parse(searchParams.get("students") || "[]");

  const [formDetails, setFormDetails] = useState({
    title: "Loading...",
    description: "",
  });
  const [formQuestions, setFormQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Extracted formID:", formID); // Debug log
    console.log("User role:", user?.role); // Debug user role
    console.log("Query Parameters:", {
      formID,
      source,
      projectCode,
      projectName,
      readOnly,
      students,
    }); // Log query params for tracing issues

    if (!user || user.role !== "Supervisor") {
      console.error("Unauthorized access attempt detected!");
      navigate(-1); // Redirect to unauthorized page
      return;
    }

    const fetchFormDetailsAndQuestions = async () => {
      setIsLoading(true);
      try {
        if (!formID) {
          throw new Error("Missing formID for fetching form data.");
        }

        console.log("Fetching form metadata and questions for formID:", formID);

        // Fetch form metadata
        const formMetadata = await formsApi.getForm(formID);
        console.log("Form Metadata Response:", formMetadata); // Debug log
        if (!formMetadata) {
          throw new Error(`No form metadata found for formID: ${formID}`);
        }

        // Set form metadata
        setFormDetails({
          title: formMetadata.formName || "Form Title",
          description: formMetadata.description || "Form Description",
        });

        // Fetch questions
        const questions = await formsApi.getQuestions(formID);
        console.log("Form Questions Response:", questions); // Debug log
        if (!questions || questions.length === 0) {
          throw new Error(`No questions found for formID: ${formID}`);
        }

        setFormQuestions(questions);
      } catch (err) {
        console.error("Error fetching form details and questions:", err);
        setError(err.message || "An error occurred while loading the form.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetailsAndQuestions();
  }, [formID, navigate, user]);

  if (isLoading) {
    return (
      <div className="text-center mt-6 text-blue-900">Loading form...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-6 text-red-500">
        {error || "Failed to load form. Please try again later."}
      </div>
    );
  }

  console.log("Form Details:", formDetails); // Debug log for form details
  console.log("Form Questions:", formQuestions); // Debug log for questions

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
        readOnly={readOnly}
      />
    );
  }
};

export default DynamicFormPage;
