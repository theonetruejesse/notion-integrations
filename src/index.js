const dotenv = require("dotenv").config();

const { Client } = require("@notionhq/client");
const life = require("./life");

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

life(notion);
console.log(new Date());

// todo (features):
// 1. Firebase daily
// 2. Graduation functionality
// 4. Github
// 5. Update Time Commitment
