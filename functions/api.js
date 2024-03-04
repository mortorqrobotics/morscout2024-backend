const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const excel = require("xlsx");
const serverless = require('serverless-http')
const app = express();
const router = express.Router()

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to submit scout form
const submitScoutForm = async (req, res, scoutType, collectionName) => {
  try {
    const { teamNumber } = req.params;
    const { username, ...formFields } = req.body;

    // Check if the teamNumber document exists in the specified collection
    const teamDocRef = admin.firestore().collection(collectionName).doc(teamNumber);
    const teamDoc = await teamDocRef.get();

    if (teamDoc.exists) {
      const scoutData = teamDoc.data()[scoutType] || {};

      // Create a new submission with the person's name
      const newSubmissionKey = `submission${Object.keys(scoutData).length + 1}`;
      const newSubmission = {
        [username]: formFields,
      };

      // Append the new submission to the existing scout data
      await teamDocRef.update({
        [`${scoutType}.${newSubmissionKey}`]: newSubmission,
      });
    } else {
      // If the document doesn't exist, create a new one
      const initialData = {
        [`submission1`]: {
          [username]: formFields,
        },
      };

      const dataToSet = {
        [scoutType]: initialData,
      };

      await teamDocRef.set(dataToSet);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Endpoint for autoscout form
router.post("/submit-autoscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "autoscout", "matchscout");
});

// Endpoint for teleopscout form
router.post("/submit-teleopscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "teleopscout", "matchscout");
});

// Endpoint for pitscout form
router.post("/submit-pitscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "pitscout", "pitscout");
});

// Function to convert data to Excel and downloada
const downloadExcel = (data, filename) => {
  // Rearrange the data to have username as the first field and submissionKey at the end
  const rearrangedData = data.map(entry => {
    const { username, ...rest } = entry;
    const { submissionKey, ...fieldsExceptSubmissionKey } = rest;
    return { username, ...fieldsExceptSubmissionKey, submissionKey };
  });

  // Sort the rearranged data by team number and username
  rearrangedData.sort((a, b) => {
    if (a.teamNumber !== b.teamNumber) return a.teamNumber.localeCompare(b.teamNumber);
    return a.username.localeCompare(b.username);
  });

  const ws = excel.utils.json_to_sheet(rearrangedData);
  const wb = excel.utils.book_new();
  excel.utils.book_append_sheet(wb, ws, "Sheet 1");
  excel.writeFile(wb, filename);
};

router.get("/pitscout", async (req, res) => {
  try {
    const pitScoutCollection = admin.firestore().collection("pitscout");

    const pitScoutDocuments = await pitScoutCollection.listDocuments();
    const pitScoutData = [];

    for (const document of pitScoutDocuments) {
      const documentRef = await document.get();
      const pitscout = documentRef.data().pitscout;

      for (const submissionKey in pitscout) {
        const submissionData = pitscout[submissionKey];
        const username = Object.keys(submissionData)[0]; // Get the username directly from the keys of submissionData
        pitScoutData.push({
          teamNumber: document.id,
          submissionKey: submissionKey,
          ...submissionData[username], // Use the username to directly access the submission data
          username: username // Include the username in the output
        });
      }
    }

    // Log the fetched data to inspect
    console.log("Pit Scout Data:", pitScoutData);

    // Download as Excel
    downloadExcel(pitScoutData, "pitscout.xlsx");

    // Send data as JSON response
    res.json(pitScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


// Endpoint to fetch match scout data and download as Excel
router.get("/matchscout", async (req, res) => {
  try {
    const matchScoutCollection = admin.firestore().collection("matchscout");

    const matchScoutDocuments = await matchScoutCollection.listDocuments();
    let matchScoutData = [];

    for (const document of matchScoutDocuments) {
      const documentRef = await document.get();
      const matchscout = documentRef.data();

      const autoscout = matchscout.autoscout || {};
      const teleopscout = matchscout.teleopscout || {};

      // Helper function to add entries to matchScoutData with proper structure
      const addEntries = (scoutType, scoutData) => {
        for (const submissionKey in scoutData) {
          const submissionData = scoutData[submissionKey];
          const username = Object.keys(submissionData)[0]; // Get the username directly from the keys of submissionData
          matchScoutData.push({
            teamNumber: document.id,
            ...submissionData[username], // Use the username to directly access the submission data
            username: username, // Include the username in the output
            scoutType: scoutType, // Include the scout type
            submissionKey: submissionKey // Include the submission key
          });
        }
      };

      // Add entries for autoscout
      addEntries('autoscout', autoscout);

      // Add entries for teleopscout
      addEntries('teleopscout', teleopscout);
    }

    // Sort the matchScoutData by team number, username, and then scout type
    matchScoutData.sort((a, b) => {
      if (a.teamNumber !== b.teamNumber) return a.teamNumber.localeCompare(b.teamNumber);
      if (a.username !== b.username) return a.username.localeCompare(b.username);
      return a.scoutType.localeCompare(b.scoutType);
    });

    // Rearrange the fields so that submissionKey appears at the end
    matchScoutData = matchScoutData.map(entry => {
      const { submissionKey, ...rest } = entry;
      return { ...rest, submissionKey };
    });

    // Log the fetched data to inspect
    console.log("Match Scout Data:", matchScoutData);

    // Download as Excel
    downloadExcel(matchScoutData, "matchscout.xlsx");

    // Send data as JSON response
    res.json(matchScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/.netlify/functions/api", router)
module.exports.handler = serverless(app);