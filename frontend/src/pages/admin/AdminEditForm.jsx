import React from "react";
import { Routes, Route } from "react-router-dom";
import DynamicFormPage from "../../components/forms/DynamicFormPage";

const AdminEditForm = () => {
  return (
    <Routes>
      <Route path=":formType" element={<DynamicFormPage />} />
    </Routes>
  );
};

export default AdminEditForm;
