
const serverless = require("serverless-http");
const app = require("./server"); // Adjust path if necessary

module.exports = serverless(app);
