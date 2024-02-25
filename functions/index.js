// MargaRH/functions/index.js

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


const sgMail = require("@sendgrid/mail");

// Set SendGrid API key
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendVacationRequestEmail = functions.firestore
    .document("vacationRequests/{requestId}")
    .onCreate(async (snap, context) => {
      const request = snap.data();

      // Fetch the user document to get the managerEmployeeNumber
      const userRef = await admin.firestore().collection("users").where("employeeNumber", "==", request.employeeNumber).get();

      if (!userRef.empty) {
        const user = userRef.docs[0].data();
        // Check if managerEmployeeNumber is not "00"
        if (user.managerEmployeeNumber && user.managerEmployeeNumber !== "00") {
          // Fetch the manager's email using managerEmployeeNumber
          const managerRef = await admin.firestore().collection("users").where("employeeNumber", "==", user.managerEmployeeNumber).get();

          if (!managerRef.empty) {
            const manager = managerRef.docs[0].data();
            // Send an email to the manager if found
            const managerMsg = {
              to: manager.email, // Manager email
              from: "vivien.richaud@gmail.com", // Use a verified sender email address
              subject: "Nouvelle demande de congé",
              text: `Une nouvelle demande de congé a été faite par ${request.customerName}. Merci de la prendre en compte.`,
              html: `<strong>Une nouvelle demande de congé a été faite par ${request.customerName}. Merci de la prendre en compte.</strong>`,
            };
            try {
              await sgMail.send(managerMsg);
              console.log("Email sent to manager");
            } catch (error) {
              console.error("Error sending email to manager", error);
            }
          }
        }
      }

      // Original message sending logic to admin
      const msg = {
        to: functions.config().sendgrid.email, // Admin email
        from: "vivien.richaud@gmail.com", // Use a verified sender email address
        subject: "Nouvelle demande de congé",
        text: `Une nouvelle demande de congé à été faite par ${request.customerName}. Merci de la prendre en compte.`,
        html: `<strong>Une nouvelle demande de congé à été faite par ${request.customerName}. Merci de la prendre en compte.</strong>`,
      };

      try {
        await sgMail.send(msg);
        console.log("Email sent to admin");
      } catch (error) {
        console.error("Error sending email to admin", error);
      }
    });
