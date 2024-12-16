import React from 'react';
import { Button } from '../ui/Button';
import { CodepenIcon as ReactIcon } from 'lucide-react';
import { CgClose } from 'react-icons/cg';

export function ProjectDetailsDialog({ isOpen, onClose, project }) {
  if (!project || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 hover:bg-gray-100 rounded transition-colors duration-200"
        >
          <CgClose />
        </Button>

        <h2 className="text-xl font-bold mb-4">{project.title}</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <p className="text-gray-700">{project.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Project Code</h3>
            <p className="text-gray-700">{project.projectCode}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Project Part</h3>
            <p className="text-gray-700">{project.part}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Supervisor</h3>
            <p className="text-gray-700">{project.supervisor}</p>
            <div className="mt-2">
              <h4 className="font-medium mb-1">Research Topics:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {project.supervisorTopics?.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-lg font-semibold mb-2">Students</h3>
            <div className="space-y-4">
              {project.students.map((student, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-gray-600">ID: {student.id}</p>
                  <p className="text-gray-600">Email: {student.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

