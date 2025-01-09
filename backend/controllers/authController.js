const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/firebaseAdmin");

// Helper function to get role-specific details
const getRoleSpecificDetails = async (role, userId) => {
  try {
    if (role === "supervisor") {
      const supervisorDoc = await db
        .collection("users")
        .doc(userId)
        .collection("supervisorDetails")
        .doc("details")
        .get();

      return supervisorDoc.exists ? supervisorDoc.data() : null;
    } else if (role === "admin") {
      const adminDoc = await db
        .collection("users")
        .doc(userId)
        .collection("adminDetails")
        .doc("details")
        .get();

      return adminDoc.exists ? adminDoc.data() : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching role-specific details:", error.message);
    throw new Error("Failed to fetch role-specific details.");
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Firestore for user by email
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userDoc.docs[0].data();
    const userId = userDoc.docs[0].id;

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Fetch role-specific details
    const roleDetails = await getRoleSpecificDetails(user.role, userId);

    // Generate JWT token
    const token = jwt.sign({ id: userId, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Remove sensitive fields before sending response
    const { password: _, ...userWithoutPassword } = user;

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        ...userWithoutPassword,
        ...(roleDetails ? { roleDetails } : {}),
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Register function
exports.register = async (req, res) => {
  const { id, fullName, email, password, role, supervisorTopics, permissions } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to Firestore
    await db.collection("users").doc(id).set({
      id,
      fullName,
      email,
      role,
      password: hashedPassword,
    });

    // Add role-specific details
    if (role === "supervisor") {
      await db
        .collection("users")
        .doc(id)
        .collection("supervisorDetails")
        .doc("details")
        .set({
          supervisorTopics: supervisorTopics || [],
        });
    } else if (role === "admin") {
      await db
        .collection("users")
        .doc(id)
        .collection("adminDetails")
        .doc("details")
        .set({
          permissions: permissions || [],
          supervisorTopics: supervisorTopics || [],
          personalNotes: "",
        });
    }

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Profile function
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userDoc.data();

    // Fetch role-specific details
    const roleDetails = await getRoleSpecificDetails(user.role, userId);

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: {
        ...userWithoutPassword,
        ...(roleDetails ? { roleDetails } : {}),
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
