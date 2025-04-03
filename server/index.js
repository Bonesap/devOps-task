const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.get("/readiness", (req, res) => {
  res.status(200).send("Ready");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
