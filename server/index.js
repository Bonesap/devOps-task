const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API Service is running");
});

app.get("/healthz", (req, res) => {
  res.send("OK");
});

app.get("/ready", (req, res) => {
  res.send("OK");
});

app.get("/startup", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});
