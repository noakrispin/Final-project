const admin = require("firebase-admin");
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
  const { id, fullName, email, role, password, supervisorTopics, isAdmin } = req.body;

  try {
    // Add user to the main collection
    const response = await addDocument("users", id, { id, fullName, email, role, password, isAdmin });
    if (!response.success) {
      return res.status(400).json({ success: false, error: "Failed to add user to main collection." });
    }

    // Handle subcollections
    if (role === "Supervisor" || isAdmin) {
      await addSubcollection("users", id, "supervisorDetails", "details", { supervisorTopics: supervisorTopics || [] });
    }
    if (isAdmin) {
      await addSubcollection("users", id, "adminDetails", "details", { permissions: "All admin permissions" });
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
    const userResponse = await getDocument("users", req.params.id);
    if (!userResponse.success) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const user = userResponse.data;

    // Fetch adminDetails if isAdmin is true
    let adminDetails = null;
    if (user.isAdmin) {
      const adminData = await getSubcollection("users", req.params.id, "adminDetails");
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
  const userId = req.params.id;

  try {
    console.log(`Deleting user with ID: ${userId}`);
    // Delete the main user document
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete the user's subcollections if any
    if (userDoc.data().role === "Supervisor") {
      await admin.firestore().collection("users").doc(userId).collection("supervisorDetails").doc("details").delete();
    }
    if (userDoc.data().role === "Admin") {
      await admin.firestore().collection("users").doc(userId).collection("adminDetails").doc("details").delete();
    }

    // Delete the main user document
    await userRef.delete();
    console.log(`User with ID ${userId} deleted successfully.`);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role, isAdmin } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role is required." });
  }

  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userDoc.data();
    const updatedData = { ...userData, role, isAdmin };

    // Add or remove adminDetails based on isAdmin
    if (isAdmin) {
      await addSubcollection("users", userId, "adminDetails", "details", { permissions: "All admin permissions" });
    } else {
      const adminDetailsRef = userRef.collection("adminDetails").doc("details");
      await adminDetailsRef.delete();
    }

    await userRef.update(updatedData);
    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Error updating user role:", error.message);
    res.status(500).json({ message: "Failed to update user role." });
  }
};

module.exports = { addUser, getUser, getAllUsers, deleteUser, updateUserRole };