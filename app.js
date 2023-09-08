const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const contactsRouter = require("./routes/api/contacts");
const registrationRouter = require("./services/registration.js");
const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const path = require ("path");

app.use(express.static(path.join(__dirname, "public")));

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouter);
app.use("/users", registrationRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const mongoose = require("mongoose");
const connection = mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
connection
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error(`Error while establishing connection: [${err}]`);
    process.exit(1);
  });

module.exports = app;
