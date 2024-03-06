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


exports.sendStatusChangeEmail = functions.firestore
    .document("vacationRequests/{requestId}")
    .onUpdate(async (change, context) => {
      const before = change.before.data();
      const after = change.after.data();

      // Proceed only if status changes to "accepté" or "refusé" from "en attente"
      if (before.status === "en attente" && (after.status === "accepté" || after.status === "refusé")) {
        // Fetch user's email using employeeNumber
        const usersRef = admin.firestore().collection("users");
        const snapshot = await usersRef.where("employeeNumber", "==", after.employeeNumber).get();

        if (snapshot.empty) {
          console.log("No matching user found for employeeNumber:", after.employeeNumber);
          return;
        }

        // Assuming there's only one user with a matching employeeNumber
        const userDoc = snapshot.docs[0].data();
        const userEmail = userDoc.email;
        const userName = after.customerName; // Or userDoc.name if you prefer the name from users collection
        let subject; let htmlContent;

        if (after.status === "accepté") {
          subject = "Demande de congés acceptée";
          htmlContent = `<strong>Bonjour ${userName},</strong><br><br>Votre demande de congés a été acceptée.<br><br>Cordialement,`;
        } else if (after.status === "refusé") {
          subject = "Demande de congés refusée";
          htmlContent = `<strong>Bonjour ${userName},</strong><br><br>Votre demande de congés a été refusée.<br><br>Cordialement,`;
        }

        const msg = {
          to: userEmail, // User's email fetched from users collection
          from: "vivien.richaud@gmail.com", // Use a verified sender email address
          subject: subject,
          html: htmlContent,
        };

        try {
          await sgMail.send(msg);
          console.log("Email sent to", userEmail);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }
    });


// firebase deploy --only functions
// npx eslint . --fix
