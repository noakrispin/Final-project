import React from 'react';
import PropTypes from 'prop-types';
import { Table } from '../ui/Table';
import { Card } from '../ui/Card';
import { Info } from 'lucide-react';
import { MdDeleteForever } from "react-icons/md";

const ProjectsTable = ({ 
  projects, 
  activeTab, 
  onEditField, 
  onAddNote, 
  onStudentClick,
  onDelete // Ensure onDelete is destructured here
}) => {
  const renderEditableCell = (value, row, field, fieldName, fieldType = 'text', options = []) => (
    <div className="group relative">
      <button
        onClick={() => onEditField(row, field, fieldName, fieldType, options)}
        className="w-full text-left hover:text-blue-600 transition-colors group-hover:bg-gray-50 p-2 rounded"
        title={`Click to edit ${fieldName.toLowerCase()}`}
      >
        {value || 'N/A'} {/* Fallback for missing values */}
      </button>
      <div className="hidden group-hover:block absolute right-0 top-1/2 transform -translate-y-1/2 mr-2">
        <Info className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const renderSupervisorCell = (supervisor1, supervisor2, row) => (
    console.log('Rendering supervisor cell:', { supervisor1, supervisor2, row }),
    <div className="space-y-1">
      <div>
        <button
          onClick={() => onEditField(row, 'supervisor1', 'Supervisor 1')}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          {supervisor1}
        </button>
      </div>
      {supervisor2 ? (
        <div>
          <button
            onClick={() => onEditField(row, 'supervisor2', 'Supervisor 2')}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            {supervisor2}
          </button>
        </div>
      ) : null}
    </div>
  );
  

  const renderStudentCell = (students) => (
    <div className="space-y-1">
      {students && students.length > 0 ? (
        students.map((student, index) => (
          <div key={index} className="group relative">
            <button
              onClick={() => onStudentClick(student)} 
              className="text-blue-600 hover:text-blue-700 transition-colors group-hover:bg-gray-50 p-2 rounded w-full text-left flex items-center"
            >
              <span>{student.fullName || "Unknown Student"}</span>
            </button>
          </div>
        ))
      ) : (
        <span>No Students</span>
      )}
    </div>
  );
  
  
  console.log('Projects dataaaaaaaaaaaaaaaa:', projects);


  const projectColumns = [
    { key: 'projectCode', header: 'Project Code', sortable: true, render: (value, row) => renderEditableCell(value, row, 'projectCode', 'Project Code') },
    { key: 'title', header: 'Project Title', sortable: true, render: (value, row) => renderEditableCell(value, row, 'title', 'Project Title') },
    { key: 'students', header: 'Students', sortable: false, render: (_, row) => renderStudentCell(row.students || []) },
    {key: 'supervisors',header: 'Supervisors',sortable: true,render: (_, row) => renderSupervisorCell(row.supervisor1, row.supervisor2, row)},
    { key: 'part', header: 'Part', sortable: true, render: (value, row) => renderEditableCell(value, row, 'part', 'Part', 'select', ['A', 'B']) },
    { key: 'type', header: 'Type', sortable: true, render: (value, row) => renderEditableCell(value, row, 'type', 'Type', 'select', ['Development', 'Research']) },
    { key: 'deadline', header: 'Deadline', sortable: true, render: (value, row) => renderEditableCell(value, row, 'deadline', 'Deadline', 'date') },
    { key: 'specialNotes', header: 'Special Notes', sortable: true, render: (value, row) => <button onClick={() => onAddNote(row)} className="text-blue-600 hover:text-blue-700">{value || 'Add note'}</button> },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(row)}
            aria-label="Delete Project"
            title="Delete Project"
          >
            <MdDeleteForever />
          </button>
        </div>
      ),
    },

  ];

  if (!projects || projects.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">No projects available to display.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Table 
      columns={projectColumns} 
      data={projects}
      showTabs={false}
      showDescription = {true}
      description = "Click any cell to edit its content. Click student names to view their details."
      onRowClick={() => {}} // Placeholder to prevent errors
          
       />
      
    </Card>
  );
};

ProjectsTable.propTypes = {
  projects: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired,
  onEditField: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onStudentClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired, 
};

export default ProjectsTable;
