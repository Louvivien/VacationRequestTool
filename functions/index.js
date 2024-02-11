const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addUserRole = functions.auth.user().onCreate(async (user) => {
  // Set a default role
  const defaultRole = "user";

  // Generate a unique 3-digit employee number
  // Note: This simplistic approach generates a number between 100 and 999
  // and may not guarantee absolute uniqueness or scale well for a large number of users.
  const employeeNumber = Math.floor(Math.random() * (999 - 100 + 1)) + 100;

  // Default manager employee number set to "00"
  const defaultManagerEmployeeNumber = "00";

  // Add a document to the 'users' collection with the user's UID
  await admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    role: defaultRole,
    employeeNumber: employeeNumber.toString(), // Store as string to preserve leading zeros
    managerEmployeeNumber: defaultManagerEmployeeNumber,
  });

  return null; // Cloud Functions expect null or a promise for non-HTTP functions
});
