import React from "react";
import { Routes, Route } from "react-router-dom";
import DynamicFormPage from "../components/forms/DynamicFormPage";

//Dynamic page for evaluation forms - it will be used to render different forms based on the formType
const EvaluationForms = () => {
  return (
    <Routes>
      <Route path=":formType" element={<DynamicFormPage />} />
    </Routes>
  );
};

export default EvaluationForms;
