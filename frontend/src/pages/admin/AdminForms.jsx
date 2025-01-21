import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { mockApi } from "../../services/mockApi";
import DynamicEditModal from "../../components/admin/DynamicEditModal";

const TABS = ["User Management", "Forms Management"];

export default function AdminForms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState("All");
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "Admin") {
      navigate("/");
    } else {
      mockApi.getAdminQuestions().then((data) => {
        setQuestions(data);
        setLoading(false);
      });
    }
  }, [user, navigate]);

  const handleSave = async (updatedQuestions) => {
    setLoading(true);
    await mockApi.updateAdminQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
    setLoading(false);
  };

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSaveEdit = (updatedRow) => {
    const updatedQuestions = questions.map((q) =>
      q.name === updatedRow.name ? updatedRow : q
    );
    handleSave(updatedQuestions);
    setEditingRow(null);
  };

  // Define the columns visible in the table
  const columns = [
    { key: "label", header: "Label", sortable: true },
    { key: "description", header: "Description", sortable: true },
    { key: "form", header: "Form", sortable: true },
    { key: "weight", header: "Weight", sortable: true },
  ];

  // Define all database fields and their configurations for the modal
  const dbFields = [
    { key: "name", header: "Question Name", type: "text" },
    {
      key: "weight",
      header: "Weight",
      type: "number",
      validation: (value) =>
        value < 0 || value > 1 ? "Weight must be between 0 and 1." : undefined,
      props: { min: 0, max: 1, step: 0.01 },
    },
    
    { key: "label", header: "Label", type: "text" },
    {
      key: "required",
      header: "Required",
      type: "select",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },{
      key: "type",
      header: "Answer Type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
      ],
    },
    {
      key: "form",
      header: "Form",
      type: "select",
      options: [
        { label: "Book Reviewer Form A", value: "bookReviewerFormA" },
        { label: "Book Reviewer Form B", value: "bookReviewerFormB" },
        { label: "Presentation Form A", value: "PresentationFormA" },
        { label: "Presentation Form B", value: "PresentationFormB" },
        { label: "Supervisor Form", value: "SupervisorForm" },
      ],
    },{
      key: "description",header: "Description",type: "textarea",props: { rows: 4 }, 
    },
    
    {
      key: "evaluates",
      header: "Evaluates",
      type: "select",
      options: [
        { label: "Student", value: "student" },
        { label: "All Project", value: null },
      ],
    },
  ];

  const filteredQuestions = questions.filter((question) => {
    if (selectedForm === "All") return true;
    return question.form === selectedForm;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Forms Management</h1>
      <div className="mb-4">
        <label htmlFor="formFilter" className="mr-2">
          Filter by Form:
        </label>
        <select
          id="formFilter"
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All</option>
          <option value="bookReviewerFormA">Book Reviewer Form A</option>
          <option value="bookReviewerFormB">Book Reviewer Form B</option>
          <option value="PresentationFormA">Presentation Form A</option>
          <option value="PresentationFormB">Presentation Form B</option>
          <option value="SupervisorForm">Supervisor Form</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table
          data={filteredQuestions}
          columns={columns}
          onRowClick={handleEdit} // Open the modal when a row is clicked
        />
      )}
      {editingRow && (
        <DynamicEditModal
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          onSave={handleSaveEdit}
          rowData={editingRow}
          dbFields={dbFields} // Pass all database fields and their configurations to the modal
        />
      )}
    </div>
  );
}
