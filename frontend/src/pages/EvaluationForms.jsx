import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import SupervisorForm from '../components/forms/SupervisorForm';
import PresentationFormA from '../components/forms/PresentationFormA';
import PresentationFormB from '../components/forms/PresentationFormB';
import BookReviewFormA from '../components/forms/BookReviewFormA';
import BookReviewFormB from '../components/forms/BookReviewFormB';

const formConfigs = [
  { id: 'supervisor', title: 'Supervisor Evaluation Form', path: 'supervisor' },
  { id: 'presentation-a', title: 'Presentation Evaluation - Step A', path: 'presentation-a' },
  { id: 'presentation-b', title: 'Presentation Evaluation - Step B', path: 'presentation-b' },
  { id: 'book-a', title: 'Book Review - Step A', path: 'book-a' },
  { id: 'book-b', title: 'Book Review - Step B', path: 'book-b' },
];

const EvaluationForms = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const filteredForms = formConfigs.filter(config => 
    config.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (formData) => {
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You might want to send this data to an API or perform other actions
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8d7ff]/70 rounded-full blur-[70px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px]" />

      <div className="relative z-10 container mx-auto p-6">
        <h1 className="text-3xl md:text-5xl font-bold text-black mb-4 md:mb-6">Evaluation Forms</h1>
        <p className="text-gray-600 text-lg md:text-xl mb-6 md:mb-8 max-w-3xl">
          Select a form type to begin the evaluation process.
        </p>

        <div className="space-y-4 md:space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms..."
              className="w-full h-12 pl-12 pr-4 bg-[#ebecf5] rounded-lg text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4">
            {filteredForms.map((config) => (
              <Button
                key={config.id}
                onClick={() => navigate(config.path)}
                variant="outline"
                size="sm"
              >
                {config.title}
              </Button>
            ))}
          </div>

          {location.pathname !== '/evaluation-forms' && (
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <Routes>
                <Route path="supervisor" element={<SupervisorForm onSubmit={handleFormSubmit} />} />
                <Route path="presentation-a" element={<PresentationFormA onSubmit={handleFormSubmit} />} />
                <Route path="presentation-b" element={<PresentationFormB onSubmit={handleFormSubmit} />} />
                <Route path="book-a" element={<BookReviewFormA onSubmit={handleFormSubmit} />} />
                <Route path="book-b" element={<BookReviewFormB onSubmit={handleFormSubmit} />} />
              </Routes>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForms;

