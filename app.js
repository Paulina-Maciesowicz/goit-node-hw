const express = require('express')
const logger = require('morgan')
const cors = require('cors')
require("dotenv").config();
const contactRoutes = require("./routes/contacts.routes");
const authRoutes = require("./routes/auth.routes");
const contactsRouter = require('./routes/api/contacts')
const app = express()
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

const mongoose = require("mongoose");
const connection = mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

app.use("/api/v1", contactRoutes);
app.use("/api/v1/auth", authRoutes);

connection
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error(`Error while establishing connection: [${err}]`);
    process.exit(1);
  });

  module.exports = app;