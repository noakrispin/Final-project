import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SupervisorForm from '../components/forms/SupervisorForm';
import PresentationFormA from '../components/forms/PresentationFormA';
import PresentationFormB from '../components/forms/PresentationFormB';
import BookReviewFormA from '../components/forms/BookReviewFormA';
import BookReviewFormB from '../components/forms/BookReviewFormB';

const EvaluationForms = () => {
  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8d7ff]/70 rounded-full blur-[70px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px]" />

      <div className="relative z-10 container mx-auto p-6">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <Routes>
            <Route path="supervisor" element={<SupervisorForm />} />
            <Route path="presentation-a" element={<PresentationFormA />} />
            <Route path="presentation-b" element={<PresentationFormB />} />
            <Route path="book-a" element={<BookReviewFormA />} />
            <Route path="book-b" element={<BookReviewFormB />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForms;
