const bcrypt = require("bcrypt");
const { addDocument, addSubcollection } = require("./utils/firebaseHelper"); // Firebase Helper functions
const users = require("../data/users.json"); // Users JSON file

const importData = async () => {
  try {
    for (const user of users) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Add user to the main "users" collection
      const userResponse = await addDocument("users", user.id, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: hashedPassword, // Store the hashed password
      });

      if (!userResponse.success) {
        console.error(`Error adding user ${user.fullName}:`, userResponse.error);
        continue;
      }

      console.log(`User ${user.fullName} added successfully.`);

      // Add subcollection for supervisors
      if (user.role === "Supervisor" || user.role === "Admin") {
        const supervisorResponse = await addSubcollection("users", user.id, "supervisorDetails", {
          supervisorTopics: user.supervisorTopics || [],
        });

        if (!supervisorResponse.success) {
          console.error(`Error adding supervisorDetails for ${user.fullName}:`, supervisorResponse.error);
        }
      }

      // Add subcollection for admins
      if (user.role === "Admin") {
        const adminResponse = await addSubcollection("users", user.id, "adminDetails", {
          permissions: ["manageUsers", "assignRoles"], // Admin permissions
        });

        if (!adminResponse.success) {
          console.error(`Error adding adminDetails for ${user.fullName}:`, adminResponse.error);
        }
      }
    }

    console.log("All users imported successfully!");
  } catch (error) {
    console.error("Error importing data:", error.message);
  }
};

importData();
