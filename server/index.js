import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello, World!"));

// Лівнес проба
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Старт проба
app.get("/startup", (req, res) => {
  res.status(200).send("Started");
});

// Реалізація проби готовності
app.get("/readiness", (req, res) => {
  res.status(200).send("Ready");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
