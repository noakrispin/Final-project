const { addDocument } = require("./utils/firebaseHelper"); 
const bcrypt = require("bcryptjs");

const users = [
  { fullName: "Renata Avrus", email: "ravros@braude.ac.il" },
];

const defaultPassword = "P123456!";
const defaultRole = "Supervisor";
const defaultIsAdmin = false;

async function addUsers() {
  console.log("Starting user insertion...");

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const userData = {
        email: user.email,
        emailId: user.email.toLowerCase(), // Normalize email to lowercase
        fullName: user.fullName,
        isAdmin: defaultIsAdmin, // Set isAdmin to false
        password: hashedPassword,
        role: defaultRole, // Set role to Supervisor
      };

      // Add user to Firestore
      const result = await addDocument("users", user.email.toLowerCase(), userData);

      if (result.success) {
        console.log(`User ${user.email} added successfully.`);

        // Add supervisorDetails subcollection with correct structure
        await addSubcollection("users", user.email.toLowerCase(), "supervisorDetails", "details", {
          email: user.email.toLowerCase(),
          fullName: user.fullName,
          role: defaultRole,
        });
      } else {
        console.error(`Failed to add user ${user.email}:`, result.error);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error.message);
    }
  }

  console.log("User insertion complete.");
}

addUsers();

