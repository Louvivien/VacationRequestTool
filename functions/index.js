// Comment out or remove unused variables
// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addUserRole = functions.auth.user().onCreate((user) => {
  // Set a default role
  const defaultRole = "user";

  // Add a document to the 'users' collection with the user's UID
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    role: defaultRole,
  });
});
