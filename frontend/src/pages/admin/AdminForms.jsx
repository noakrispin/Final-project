import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/Table";
import { formsApi } from "../../services/formAPI";

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch forms on component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const fetchedForms = await formsApi.getAllForms(); 
        console.log("Fetched forms:", fetchedForms);
        setForms(fetchedForms);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  // Navigate to the evaluation form page
  const handleRowClick = (form) => {
    navigate(`/evaluation-forms/${form.formID}?formID=${form.formID}`); // Navigate to the form's evaluation page
  };

  // Define columns for the table
  const columns = [
    { key: "formName", header: "Form Name", sortable: true },
    { key: "description", header: "Form Description", sortable: true },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forms Management</h1>
      {loading ? (
        <p>Loading forms...</p>
      ) : (
        <Table
          data={forms}
          columns={columns}
          onRowClick={handleRowClick} 
          className="bg-white shadow rounded-lg"
        />
      )}
    </div>
  );
};

export default AdminForms;
