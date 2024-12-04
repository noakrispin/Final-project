import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import SupervisorForm from '../components/forms/SupervisorForm'
import PresentationFormA from '../components/forms/PresentationFormA'
import PresentationFormB from '../components/forms/PresentationFormB'
import BookReviewFormA from '../components/forms/BookReviewFormA'
import BookReviewFormB from '../components/forms/BookReviewFormB'

const formConfigs = [
  { id: 'supervisor', title: 'Supervisor Evaluation Form', component: SupervisorForm },
  { id: 'presentation-a', title: 'Presentation Evaluation - Step A', component: PresentationFormA },
  { id: 'presentation-b', title: 'Presentation Evaluation - Step B', component: PresentationFormB },
  { id: 'book-a', title: 'Book Review - Step A', component: BookReviewFormA },
  { id: 'book-b', title: 'Book Review - Step B', component: BookReviewFormB },
]

const EvaluationForms = () => {
  const [activeForm, setActiveForm] = useState(formConfigs[0].id)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (formData) => {
    console.log('Form submitted:', formData)
    // Here you would typically send this data to your backend
  }

  const filteredForms = formConfigs.filter(config => 
    config.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const ActiveFormComponent = formConfigs.find(config => config.id === activeForm)?.component || null

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
                onClick={() => setActiveForm(config.id)}
                variant={activeForm === config.id ? 'default' : 'outline'}
                size="sm"
              >
                {config.title}
              </Button>
            ))}
          </div>

          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-4">{formConfigs.find(config => config.id === activeForm)?.title}</h2>
            {ActiveFormComponent && <ActiveFormComponent onSubmit={handleSubmit} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationForms