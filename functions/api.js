const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const excel = require("xlsx");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const serviceAccount = require("./serviceAccount.json");

async function getMatchScoutData(documents, part = "") {
  let matchScoutData = [];

  for (const document of documents) {
    const documentRef = await document.get();
    const matchscout = documentRef.data();

    const autoscout = matchscout.autoscout || {};
    const teleopscout = matchscout.teleopscout || {};

    const addEntries = (scoutType, scoutData) => {
      for (const submissionKey in scoutData) {
        const submissionData = scoutData[submissionKey];
        const username = Object.keys(submissionData)[0];
        matchScoutData.push({
          teamNumber: document.id,
          ...submissionData[username],
          username: username,
          scoutType: scoutType,
          submissionKey: submissionKey,
        });
      }
    };
    if (part === "") {
      addEntries("teleopscout", teleopscout);
      addEntries("autoscout", autoscout);
    } else if (part === "autoscout") {
      addEntries("autoscout", autoscout);
    } else if (part === "teleopscout") {
      addEntries("teleopscout", teleopscout);
    }
  }
  matchScoutData.sort((a, b) => {
    if (a.teamNumber !== b.teamNumber)
      return a.teamNumber.localeCompare(b.teamNumber);
    if (a.username !== b.username) return a.username.localeCompare(b.username);
    return a.scoutType.localeCompare(b.scoutType);
  });
  return matchScoutData;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const submitScoutForm = async (req, res, scoutType, collectionName) => {
  try {
    const { teamNumber } = req.params;
    const { username, ...formFields } = req.body;

    const teamDocRef = admin
      .firestore()
      .collection(collectionName)
      .doc(teamNumber);
    const teamDoc = await teamDocRef.get();

    if (teamDoc.exists) {
      const scoutData = teamDoc.data()[scoutType] || {};

      const newSubmissionKey = `submission${Object.keys(scoutData).length + 1}`;
      const newSubmission = {
        [username]: formFields,
      };

      await teamDocRef.update({
        [`${scoutType}.${newSubmissionKey}`]: newSubmission,
      });
    } else {
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

router.post("/submit-autoscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "autoscout", "matchscout");
});

router.post("/submit-teleopscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "teleopscout", "matchscout");
});

router.post("/submit-pitscout/:teamNumber", async (req, res) => {
  submitScoutForm(req, res, "pitscout", "pitscout");
});

const downloadExcel = (data, filename) => {
  const rearrangedData = data.map((entry) => {
    const { username, ...rest } = entry;
    const { submissionKey, ...fieldsExceptSubmissionKey } = rest;
    return { username, ...fieldsExceptSubmissionKey, submissionKey };
  });

  rearrangedData.sort((a, b) => {
    if (a.teamNumber !== b.teamNumber)
      return a.teamNumber.localeCompare(b.teamNumber);
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
        const username = Object.keys(submissionData)[0];
        pitScoutData.push({
          teamNumber: document.id,
          submissionKey: submissionKey,
          ...submissionData[username],
          username: username,
        });
      }
    }

    res.json(pitScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/matchscout", async (req, res) => {
  try {
    const matchScoutCollection = admin.firestore().collection("matchscout");
    const matchScoutDocuments = await matchScoutCollection.listDocuments();
    const matchScoutData = await getMatchScoutData(matchScoutDocuments);
    res.json(matchScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/teleopscout", async (req, res) => {
  try {
    const matchScoutCollection = admin.firestore().collection("matchscout");
    const matchScoutDocuments = await matchScoutCollection.listDocuments();
    const matchScoutData = await getMatchScoutData(matchScoutDocuments, "teleopscout");

    res.json(matchScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/autoscout", async (req, res) => {
  try {
    const matchScoutCollection = admin.firestore().collection("matchscout");
    const matchScoutDocuments = await matchScoutCollection.listDocuments();
    const matchScoutData = await getMatchScoutData(matchScoutDocuments, "autoscout");

    res.json(matchScoutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


router.get("/all-scout-instances", async (req, res) => {
  try {
    const pitScoutCollection = admin.firestore().collection("pitscout");
    const matchScoutCollection = admin.firestore().collection("matchscout");

    const pitScoutDocuments = await pitScoutCollection.listDocuments();
    const matchScoutDocuments = await matchScoutCollection.listDocuments();

    let pitScoutInstances = [];
    let matchScoutInstances = [];

    for (const document of pitScoutDocuments) {
      const documentRef = await document.get();
      const pitscout = documentRef.data().pitscout;

      for (const submissionKey in pitscout) {
        const submissionData = pitscout[submissionKey];
        const username = Object.keys(submissionData)[0];
        pitScoutInstances.push({
          teamNumber: document.id,
          submissionKey,
          ...submissionData[username],
          username,
          scoutType: "pitscout",
        });
      }
    }

    for (const document of matchScoutDocuments) {
      const documentRef = await document.get();
      const matchscout = documentRef.data();

      const autoscout = matchscout.autoscout || {};
      const teleopscout = matchscout.teleopscout || {};

      const checkScoutInstances = (scoutData, scoutType) => {
        for (const submissionKey in scoutData) {
          const submissionData = scoutData[submissionKey];
          const username = Object.keys(submissionData)[0];
          matchScoutInstances.push({
            teamNumber: document.id,
            submissionKey,
            ...submissionData[username],
            username,
            scoutType,
          });
        }
      };

      checkScoutInstances(autoscout, "autoscout");
      checkScoutInstances(teleopscout, "teleopscout");
    }

    res.json({ pitScoutInstances, matchScoutInstances });
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

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
