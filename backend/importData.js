const db = require("./config/firebaseAdmin"); // Ensure this points to your Firebase configuration

async function addScheduledReminders() {
  console.log("Adding scheduled reminders...");
  try {
    const reminders = [
      {
        userEmails: ["charlie.davis@e.braude.ac.il", "noa.krispin@e.braude.ac.il"],
        scheduleDateTime: new Date("2025-01-24T15:11:00Z"),
        message: "Reminder: Check the project's status.",
        status: "pending",
        createdAt: new Date(),
      },
      {
        userEmails: ["Naomi.Lavi@e.braude.ac.il"],
        scheduleDateTime: new Date("2025-01-25T10:00:00Z"),
        message: "Reminder: Submit your project updates.",
        status: "pending",
        createdAt: new Date(),
      },
    ];

    const batch = db.firestore().batch();

    reminders.forEach((reminder, index) => {
      const docRef = db.firestore().collection("scheduled_reminders").doc(`reminder_${index + 1}`);
      batch.set(docRef, reminder);
    });

    await batch.commit();
    console.log("Scheduled reminders added successfully!");
  } catch (error) {
    console.error("Error adding scheduled reminders:", error.message);
  }
}

async function main() {
  console.log("Starting scheduled reminders setup...");
  await addScheduledReminders();
  console.log("Setup complete!");
}

main().catch((error) => {
  console.error("Setup failed:", error.message);
});
