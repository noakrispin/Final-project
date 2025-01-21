import React, { useState } from "react";

const SetGlobalDeadline = () => {
  const [deadline, setDeadline] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!deadline) {
      setStatus({ success: false, message: "Please select a deadline." });
      return;
    }

    try {
      // Convert deadline to a UNIX timestamp (milliseconds)
      const timestamp = new Date(deadline).getTime();

      const response = await fetch("http://localhost:3001/api/projects/global-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deadline: timestamp,
          emailMessage: emailMessage || undefined, // Include message only if provided
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to set deadline.");
      }

      const data = await response.json();
      setStatus({ success: true, message: data.message });
    } catch (error) {
      setStatus({ success: false, message: error.message });
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Set Global Deadline</h1>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Deadline:</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ padding: "5px", width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Email Message (Optional):</label>
        <textarea
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          style={{ padding: "5px", width: "100%" }}
          rows="4"
          placeholder="You can provide a custom email message here."
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Submit
      </button>

      {status && (
        <div
          style={{
            marginTop: "20px",
            color: status.success ? "green" : "red",
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default SetGlobalDeadline;
