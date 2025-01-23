const {
  addDocument,
  getDocument,
  addSubcollection,
  getAllProjects,
  updateProject,
} = require("./utils/firebaseHelper");
const db = require("./config/firebaseAdmin"); // Ensure this points to your Firebase configuration

// Mapping of old IDs to new emails
const idToEmailMap = {
  "029087641": "charlie.davis@e.braude.ac.il",
  "123456789": "noa.krispin@e.braude.ac.il",
  "319746850": "Naomi.Lavi@e.braude.ac.il",
  "987654321": "bob.admin@e.braude.ac.il",
};

async function migrateUserKeys() {
  console.log("Starting user migration...");
  for (const [oldId, newEmail] of Object.entries(idToEmailMap)) {
    try {
      // Get the old user document
      const { success, data: userData } = await getDocument("users", oldId);
      if (!success) {
        console.warn(`User with ID ${oldId} does not exist. Skipping...`);
        continue;
      }

      // Add the new user document with emailId as the key
      const newUserData = { ...userData, emailId: newEmail, email: newEmail };
      await addDocument("users", newEmail, newUserData);

      // Migrate subcollections (e.g., supervisorDetails, adminDetails)
      const subcollections = ["supervisorDetails", "adminDetails"];
      for (const subcollection of subcollections) {
        const { success, data: subData } = await getDocument(
          `users/${oldId}/${subcollection}`,
          "details"
        );
        if (success) {
          await addSubcollection("users", newEmail, subcollection, "details", subData);
        }
      }

      // Delete the old document (if needed)
      await db.collection("users").doc(oldId).delete();

      console.log(`Successfully migrated user: ${oldId} -> ${newEmail}`);
    } catch (error) {
      console.error(`Error migrating user ${oldId}:`, error.message);
    }
  }
}

async function migrateProjects() {
  console.log("Starting project migration...");
  try {
    const { success, data: projects } = await getAllProjects();
    if (!success) throw new Error("Failed to fetch projects");

    for (const project of projects) {
      const updatedProjectData = { ...project };
      let updated = false;

      // Update supervisor fields in each project
      if (project.supervisor1 && idToEmailMap[project.supervisor1]) {
        updatedProjectData.supervisor1 = idToEmailMap[project.supervisor1];
        updated = true;
      }
      if (project.supervisor2 && idToEmailMap[project.supervisor2]) {
        updatedProjectData.supervisor2 = idToEmailMap[project.supervisor2];
        updated = true;
      }

      // Save updated project data if changes were made
      if (updated) {
        await updateProject(project.id, updatedProjectData);
        console.log(`Updated project: ${project.id}`);
      }
    }
  } catch (error) {
    console.error("Error migrating projects:", error.message);
  }
}

async function main() {
  console.log("Starting full migration...");
  await migrateUserKeys();
  await migrateProjects();
  console.log("Migration complete!");
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
});
