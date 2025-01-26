const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/firebaseAdmin");
const { sendEmail } = require("../utils/emailService");

// Helper function to get role-specific details
const getRoleSpecificDetails = async (role, emailId) => {
  try {
    if (role === "Supervisor") {
      const supervisorDoc = await db
        .collection("users")
        .doc(emailId) // Use emailId here
        .collection("supervisorDetails")
        .doc("details")
        .get();

      return supervisorDoc.exists ? supervisorDoc.data() : null;
    } else if (role === "Admin") {
      const adminDoc = await db
        .collection("users")
        .doc(emailId) // Use emailId here
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
      .doc(email) // Use email as the key
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userDoc.data();
    const emailId = user.email; // Rename for consistency

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Fetch role-specific details
    const roleDetails = await getRoleSpecificDetails(user.role, emailId);

    // Generate JWT token
    const token = jwt.sign({ emailId, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        emailId, // Use the new identifier name
        ...user,
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
  const { email, fullName, password, role, supervisorTopics, permissions } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to Firestore
    const emailId = email; // Rename for clarity
    await db.collection("users").doc(emailId).set({
      emailId, // Include as the identifier in the user object
      fullName,
      email,
      role,
      password: hashedPassword,
    });

    // Add role-specific details
    if (role === "Supervisor") {
      await db
        .collection("users")
        .doc(emailId)
        .collection("supervisorDetails")
        .doc("details")
        .set({
          supervisorTopics: supervisorTopics || [],
        });
    } else if (role === "Admin") {
      await db
        .collection("users")
        .doc(emailId)
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
 

// Get Profile function
exports.getProfile = async (req, res) => {
  const emailId = req.user.email;

  try {
    const userDoc = await db.collection("users").doc(emailId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userDoc.data();

    // Fetch role-specific details
    const roleDetails = await getRoleSpecificDetails(user.role, emailId);

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
  const { email } = req.body;

  try {
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
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
  const { email, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    console.log(`Resetting password for email: ${email}`);

    // Directly access the document by email (which is the doc ID)
    const userDoc = await db.collection("users").doc(email).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in Firestore
    await db.collection("users").doc(email).update({
      password: hashedPassword,
    });

    console.log(`Password successfully updated for email: ${email}`);
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password. Please try again.",
    });
  }
};

