const bcrypt = require("bcrypt");
const db = require("./config/firebaseAdmin"); // Firebase Admin SDK initialized

// Sample data for users
const users = [
  {
    id: "098638241",
    fullName: "Alice Johnson",
    email: "alice.johnson@e.braude.co.il",
    role: "student",
    password: "password123", // Plain-text password
  },
  {
    id: "2",
    fullName: "Dr. Emily Carter",
    email: "emily.carter@e.braude.co.il",
    role: "supervisor",
    password: "password456", // Plain-text password
  },
  // Add more user data here...
];

// Function to hash passwords and import data
const importData = async () => {
  try {
    for (const user of users) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Add the user to Firestore
      await db.collection("users").doc(user.id).set({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: hashedPassword, // Store hashed password
      });

      console.log(`User ${user.fullName} added successfully.`);
    }
    console.log("All users imported successfully!");
  } catch (error) {
    console.error("Error importing data:", error.message);
  }
};

importData();
