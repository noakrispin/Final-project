import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table } from '../ui/Table';
import { Card } from '../ui/Card';
import { Info } from 'lucide-react';

const ProjectsTable = ({ 
  projects, 
  activeTab, 
  onEditField, 
  onAddNote, 
  onStudentClick 
}) => {
  const renderEditableCell = (value, row, field, fieldName, fieldType = 'text', options = []) => (
    <div className="group relative">
      <button
        onClick={() => onEditField(row, field, fieldName, fieldType, options)}
        className="w-full text-left hover:text-blue-600 transition-colors group-hover:bg-gray-50 p-2 rounded"
        title={`Click to edit ${fieldName.toLowerCase()}`}
      >
        {value}
      </button>
      <div className="hidden group-hover:block absolute right-0 top-1/2 transform -translate-y-1/2 mr-2">
        <Info className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const renderStudentCell = (students) => (
    <div className="space-y-1">
      {students.map((student, index) => (
        <div key={index} className="group relative">
          <button
            onClick={() => onStudentClick(student)}
            className="text-blue-600 hover:text-blue-700 transition-colors group-hover:bg-gray-50 p-2 rounded w-full text-left flex items-center"
          >
            <span>{student.name}</span>
            <Info className="w-4 h-4 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      ))}
    </div>
  );

  const projectColumns = [
    { 
      key: 'number',
      header: '#',
      sortable: true
    },
    { 
      key: 'projectCode',
      header: 'Project Code',
      sortable: true,
      render: (value, row) => renderEditableCell(value, row, 'projectCode', 'Project Code')
    },
    { 
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (value, row) => renderEditableCell(value, row, 'title', 'Project Title')
    },
    { 
      key: 'students',
      header: 'Students',
      sortable: false,
      render: (_, row) => renderStudentCell([
        row.student1,
        ...(row.student2 ? [row.student2] : [])
      ])
    },
    { 
      key: 'supervisor1',
      header: 'Supervisor',
      sortable: true,
      render: (value, row) => renderEditableCell(
        row.supervisor2 ? `${value}, ${row.supervisor2}` : value,
        row,
        'supervisor1',
        'Supervisor'
      )
    },
    { 
      key: 'part',
      header: 'Part',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value,
        row,
        'part',
        'Part',
        'select',
        ['A', 'B']
      )
    },
    { 
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value,
        row,
        'type',
        'Type',
        'select',
        ['Development', 'Research']
      )
    },
    { 
      key: 'deadline',
      header: 'Deadline',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value || '-',
        row,
        'deadline',
        'Deadline',
        'date'
      )
    },
    { 
      key: 'specialNotes',
      header: 'Special Notes',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value || 'Add note',
        row,
        'specialNotes',
        'Special Notes'
      )
    }
  ];

  const projectData = useMemo(() => {
    return projects
      .filter(project => {
        switch(activeTab) {
          case 'All Projects':
            return true;
          case 'Part A':
            return project.part === 'A';
          case 'Part B':
            return project.part === 'B';
          default:
            return true;
        }
      })
      .map((project, index) => ({
        ...project,
        number: index + 1
      }));
  }, [projects, activeTab]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{activeTab} Projects</h2>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Hover over cells to see edit options</span>
        </div>
      </div>
      <Table
        columns={projectColumns}
        data={projectData}
      />
    </Card>
  );
};

ProjectsTable.propTypes = {
  projects: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired,
  onEditField: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onStudentClick: PropTypes.func.isRequired
};

export default ProjectsTable;

