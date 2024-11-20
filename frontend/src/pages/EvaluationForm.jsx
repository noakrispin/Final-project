import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '../components/Button'

const FormField = ({ label, type, value, onChange, min, max }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={label}>
      {label}
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      id={label}
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
    />
  </div>
)

const EvaluationForm = ({ formConfig, onSubmit }) => {
  const [formData, setFormData] = useState(
    formConfig.fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  )

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">{formConfig.title}</h2>
      {formConfig.fields.map((field) => (
        <FormField
          key={field.name}
          label={field.label}
          type={field.type}
          value={formData[field.name]}
          onChange={handleChange}
          min={field.min}
          max={field.max}
        />
      ))}
      <Button type="submit" variant="primary" size="lg">
        Submit
      </Button>
    </form>
  )
}

const formConfigs = [
  {
    id: 'supervisor',
    title: 'Supervisor Evaluation Form',
    fields: [
      { name: 'projectName', label: 'Project Name', type: 'text' },
      { name: 'supervisorName', label: 'Supervisor Name', type: 'text' },
      { name: 'workQuality', label: 'Quality of Work Process (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'deliverables', label: 'Quality of Project Deliverables (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'overallEvaluation', label: 'Overall Evaluation (0-100)', type: 'number', min: 0, max: 100 },
    ]
  },
  {
    id: 'presentation-a',
    title: 'Presentation Evaluation - Step A',
    fields: [
      { name: 'projectTitle', label: 'Project Title', type: 'text' },
      { name: 'presenters', label: 'Presenters', type: 'text' },
      { name: 'contentQuality', label: 'Content Quality (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'presentationSkills', label: 'Presentation Skills (0-100)', type: 'number', min: 0, max: 100 },
    ]
  },
  {
    id: 'presentation-b',
    title: 'Presentation Evaluation - Step B',
    fields: [
      { name: 'projectTitle', label: 'Project Title', type: 'text' },
      { name: 'presenters', label: 'Presenters', type: 'text' },
      { name: 'implementation', label: 'Implementation Quality (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'results', label: 'Results and Conclusions (0-100)', type: 'number', min: 0, max: 100 },
    ]
  },
  {
    id: 'book-a',
    title: 'Book Review - Step A',
    fields: [
      { name: 'bookTitle', label: 'Book Title', type: 'text' },
      { name: 'authors', label: 'Authors', type: 'text' },
      { name: 'contentQuality', label: 'Content Quality (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'organization', label: 'Organization and Structure (0-100)', type: 'number', min: 0, max: 100 },
    ]
  },
  {
    id: 'book-b',
    title: 'Book Review - Step B',
    fields: [
      { name: 'bookTitle', label: 'Book Title', type: 'text' },
      { name: 'authors', label: 'Authors', type: 'text' },
      { name: 'finalContent', label: 'Final Content Quality (0-100)', type: 'number', min: 0, max: 100 },
      { name: 'overallQuality', label: 'Overall Quality (0-100)', type: 'number', min: 0, max: 100 },
    ]
  },
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

          {formConfigs.map((config) => (
            activeForm === config.id && (
              <EvaluationForm
                key={config.id}
                formConfig={config}
                onSubmit={handleSubmit}
              />
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default EvaluationForms; 