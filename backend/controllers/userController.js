const { addDocument, getDocument, addSubcollection, getSubcollection } = require("../utils/firebaseHelper");

// Helper function to handle subcollections
const handleSubcollections = async (id, role, supervisorTopics) => {
  try {
    if (role === "Supervisor" || role === "Admin") {
      await addSubcollection("users", id, "supervisorDetails", { supervisorTopics });
    }
    if (role === "Admin") {
      await addSubcollection("users", id, "adminDetails", { permissions: ["manageUsers", "assignRoles"] });
    }
  } catch (error) {
    console.error("Error adding subcollections:", error.message);
    throw new Error("Failed to add subcollections");
  }
};

// Add a new user
const addUser = async (req, res) => {
  const { id, fullName, email, role, password, supervisorTopics } = req.body;

  try {
    // Add user to the main collection
    const response = await addDocument("users", id, { id, fullName, email, role, password });
    if (!response.success) {
      return res.status(400).json({ success: false, error: "Failed to add user to main collection." });
    }

    // Handle subcollections if required
    if (role === "Supervisor" || role === "Admin") {
      await handleSubcollections(id, role, supervisorTopics || []);
    }

    res.status(201).json({ success: true, message: "User added successfully." });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).json({ success: false, error: "Failed to add user." });
  }
};

// Fetch user details along with subcollections
const getUser = async (req, res) => {
  try {
    // Fetch main user details
    const userResponse = await getDocument("users", req.params.id);
    if (!userResponse.success) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // Fetch supervisorDetails subcollection (if exists)
    let supervisorDetails = null;
    if (userResponse.data.role === "Supervisor") {
      const supervisorData = await getSubcollection("users", req.params.id, "supervisorDetails");
      supervisorDetails = supervisorData.success ? supervisorData.data : null;
    }

    // Fetch adminDetails subcollection (if exists)
    let adminDetails = null;
    if (userResponse.data.role === "Admin") {
      const adminData = await getSubcollection("users", req.params.id, "adminDetails");
      adminDetails = adminData.success ? adminData.data : null;
    }

    res.json({
      success: true,
      data: {
        ...userResponse.data,
        supervisorDetails,
        adminDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch user." });
  }
};

module.exports = { addUser, getUser };
