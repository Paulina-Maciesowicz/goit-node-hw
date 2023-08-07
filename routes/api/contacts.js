const contactsMethots = require("./contactsMethots.js");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const contacts = await contactsMethots.listContacts();
  // console.log(contacts);
  res.status(200).json(contacts);
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const contactsId = await contactsMethots.getContactById(id);
  console.log(id)
  res.status(200).json(contactsId);
});

router.post("/", async (req, res, next) => {
  res.json({ message: "template message post" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message delete" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message put" });
});

module.exports = router;
