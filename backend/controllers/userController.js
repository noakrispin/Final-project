const admin = require("firebase-admin");
const { addDocument, getDocument, addSubcollection, getSubcollection } = require("../utils/firebaseHelper");

// Helper function to handle subcollections
const handleSubcollections = async (emailId, role, supervisorTopics) => {
  try {
    if (role === "Supervisor" || role === "Admin") {
      await addSubcollection("users", emailId, "supervisorDetails", { supervisorTopics });
    }
    if (role === "Admin") {
      await addSubcollection("users", emailId, "adminDetails", { permissions: ["manageUsers", "assignRoles"] });
    }
  } catch (error) {
    console.error("Error adding subcollections:", error.message);
    throw new Error("Failed to add subcollections");
  }
};

// Add a new user
const addUser = async (req, res) => {
  const { email, fullName, role, password, supervisorTopics, isAdmin = false } = req.body;

  try {
    const isAdminValue = !!isAdmin; // Ensure `isAdmin` is always a boolean
    const emailId = email; // Use email as the document ID
    const response = await addDocument("users", emailId, { emailId, fullName, email, role, password, isAdmin: isAdminValue });

    if (!response.success) {
      return res.status(400).json({ success: false, error: "Failed to add user to main collection." });
    }

    if (role === "Supervisor" || isAdminValue) {
      await addSubcollection("users", emailId, "supervisorDetails", "details", { supervisorTopics: supervisorTopics || [] });
    }
    if (isAdminValue) {
      await addSubcollection("users", emailId, "adminDetails", "details", { permissions: "All admin permissions" });
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
    const emailId = req.params.id; // Use email as the document ID
    const userResponse = await getDocument("users", emailId);

    if (!userResponse.success) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const user = userResponse.data;

    // Fetch adminDetails if isAdmin is true
    let adminDetails = null;
    if (user.isAdmin) {
      const adminData = await getSubcollection("users", emailId, "adminDetails");
      adminDetails = adminData.success ? adminData.data : null;
    }

    res.status(200).json({
      success: true,
      data: { ...user, adminDetails },
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch user." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users from Firestore...");
    const usersSnapshot = await admin.firestore().collection("users").get();

    if (usersSnapshot.empty) {
      console.log("No users found in Firestore.");
      return res.status(404).json({ success: false, message: "No users found" });
    }

    console.log("Users snapshot fetched successfully.");
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Processed users data:", users);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const deleteUser = async (req, res) => {
  const emailId = req.params.id; // Use email as the document ID

  try {
    console.log(`Deleting user with emailId: ${emailId}`);
    const userRef = admin.firestore().collection("users").doc(emailId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete the user's subcollections if any
    if (userDoc.data().role === "Supervisor") {
      await userRef.collection("supervisorDetails").doc("details").delete();
    }
    if (userDoc.data().role === "Admin") {
      await userRef.collection("adminDetails").doc("details").delete();
    }

    // Delete the main user document
    await userRef.delete();
    console.log(`User with emailId ${emailId} deleted successfully.`);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params; // This should now be emailId
  const { role, isAdmin } = req.body;

  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedData = { ...userDoc.data(), role, isAdmin: !!isAdmin };

    if (updatedData.isAdmin) {
      await addSubcollection("users", userId, "adminDetails", "details", { permissions: "All admin permissions" });
    } else {
      await userRef.collection("adminDetails").doc("details").delete();
    }

    await userRef.update(updatedData);
    console.log("User role updated successfully:", updatedData);
    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Error updating user role:", error.message);
    res.status(500).json({ message: "Failed to update user role." });
  }
};

module.exports = { addUser, getUser, getAllUsers, deleteUser, updateUserRole };