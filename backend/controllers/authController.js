const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/firebaseAdmin");
const { sendEmail } = require("../utils/emailService");

// Helper function to get role-specific details
const getRoleSpecificDetails = async (role, userId) => {
  try {
    if (role === "Supervisor") {
      const supervisorDoc = await db
        .collection("users")
        .doc(userId)
        .collection("supervisorDetails")
        .doc("details")
        .get();

      return supervisorDoc.exists ? supervisorDoc.data() : null;
    } else if (role === "Admin") {
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
    if (role === "Supervisor") {
      await db
        .collection("users")
        .doc(id)
        .collection("supervisorDetails")
        .doc("details")
        .set({
          supervisorTopics: supervisorTopics || [],
        });
    } else if (role === "Admin") {
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
    // Temporarily comment out email-sending functionality
    /*
    // Send email notification
    const emailText = `
      Hello ${fullName},

      Thank you for registering on our site. Your account has been successfully created. You can now log in and access all features.

      Regards,
      The Final Project Team
    `;
    await sendEmail(email, "Welcome to Final Project Portal", emailText);
  */
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

exports.verifyUser = async (req, res) => {
  const { email, id } = req.body;

  try {
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .where("id", "==", id)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return res.status(404).json({ success: false, message: "User not found or invalid credentials." });
    }

    res.status(200).json({ success: true, message: "User verified successfully." });
  } catch (error) {
    console.error("Error verifying user:", error.message);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// Reset Password function
exports.resetPassword = async (req, res) => {
  const { email, id, newPassword } = req.body;

  try {
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .where("id", "==", id)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return res.status(404).json({ success: false, message: "User not found or invalid credentials" });
    }

    const user = userDoc.docs[0];
    const userId = user.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").doc(userId).update({
      password: hashedPassword,
    });
    // Temporarily comment out email-sending functionality
    /*
    // Send email notification
    const emailText = `Hello,\n\nYour password has been successfully reset. If you didn't request this change, please contact support immediately.\n\nRegards,\nYour Team`;
    await sendEmail(email, "Password Reset Confirmation", emailText);
  */
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};