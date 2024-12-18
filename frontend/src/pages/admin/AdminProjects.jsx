import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { BlurElements } from '../../components/shared/BlurElements';

const AdminDashboard = () => {
  // These would be fetched from your API in a real application
  const projectStats = {
    total: 50,
    partA: 30,
    partB: 20,
    pending: 15,
  };

  const recentProjects = [
    { id: 1, title: 'AI-powered Chatbot', students: 'John Doe, Jane Smith', supervisor: 'Dr. Smith', part: 'A' },
    { id: 2, title: 'Blockchain for Supply Chain', students: 'Alice Johnson', supervisor: 'Dr. Brown', part: 'A' },
    { id: 3, title: 'IoT Home Automation', students: 'Bob Brown, Carol White', supervisor: 'Dr. Wilson', part: 'B' },
  ];

  const projectColumns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Students', accessor: 'students' },
    { header: 'Supervisor', accessor: 'supervisor' },
    { header: 'Part', accessor: 'part' },
  ];

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />
      
      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Projects Overview</h1>
          <Button 
            onClick={() => window.location.href = '/admin-upload'}
            className="bg-[#6366F1] hover:bg-[#5558E1] text-white"
          >
            Upload New Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Total Projects</h2>
              <p className="text-3xl font-bold">{projectStats.total}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Part A Projects</h2>
              <p className="text-3xl font-bold text-blue-600">{projectStats.partA}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Part B Projects</h2>
              <p className="text-3xl font-bold text-green-600">{projectStats.partB}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Pending Assignments</h2>
              <p className="text-3xl font-bold text-yellow-600">{projectStats.pending}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <Table
            columns={projectColumns}
            data={recentProjects}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

