const functions = require("firebase-functions");
const { Client } = require("@notionhq/client");
const life = require("./life");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const notion = new Client({
  auth: functions.config().notion.auth_token,
});

// exports.generateLifeTasks = functions.https.onRequest((_, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   life(notion);
//   response.send("Hello from Firebase!");
// });

// this function runs everyday, at 8 am
exports.generateLifeTasks = functions.pubsub
  .schedule("0 8 * * 1-7")
  .timeZone("America/Los_Angeles")
  .onRun((_) => life(notion));

// V1 Todo
// Graduation
// Deploy on Firebase
// Fix Streaks
// Github
