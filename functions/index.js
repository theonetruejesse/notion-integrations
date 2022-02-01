const functions = require("firebase-functions");
const { Client } = require("@notionhq/client");
const life = require("./life");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const notion = new Client({
  auth: functions.config().notion.auth_token,
});

exports.helloWorld = functions.https.onRequest((_, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  life(notion);
  response.send("Hello from Firebase!");
});
