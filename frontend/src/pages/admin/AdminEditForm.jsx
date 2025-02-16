import React from "react";
import { Routes, Route } from "react-router-dom";
import DynamicFormPage from "../../components/forms/DynamicFormPage";

/**
 * This component renders the admin edit form page.
 * It uses React Router to dynamically load the form based on the form type specified in the URL.
 */
const AdminEditForm = () => {
  return (
    <Routes>
      <Route path=":formType" element={<DynamicFormPage />} />
    </Routes>
  );
};

export default AdminEditForm;
