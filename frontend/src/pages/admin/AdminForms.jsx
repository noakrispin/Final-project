import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { api } from "../../services/api";
import DynamicEditModal from "../../components/admin/DynamicEditModal";

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
      api.getAdminQuestions().then((data) => {
        setQuestions(data);
        setLoading(false);
      });
    }
  }, [user, navigate]);

  const handleSave = async (updatedQuestions) => {
    setLoading(true);
    await api.updateAdminQuestions(updatedQuestions);
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

  // Define all database fields to include in the modal
  const dbFields = [
    { key: "name", header: "Question Name" },
    { key: "label", header: "Label" },
    { key: "type", header: "Type" },
    { key: "required", header: "Required" },
    { key: "description", header: "Description" },
    { key: "form", header: "Form" },
    { key: "weight", header: "Weight" },
    { key: "evaluates", header: "Evaluates" },
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
          dbFields={dbFields} // Pass all database fields to the modal
        />
      )}
    </div>
  );
}
