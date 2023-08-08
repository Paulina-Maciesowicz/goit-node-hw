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
  console.log(id);
  res.status(200).json(contactsId);
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    console.log(req.body.name);
    const contactsAdded = await contactsMethots.addContact(name, email, phone);
    res.status(201).json(contactsAdded);
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const contact = await contactsMethots.getContactById(contactId);
    console.log(contact)
    if (typeof contact === "test") {
      return res.status(404).json({ error: "Contact not found" });
    }
    await contactsMethots.removeContact(contactId);
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message put" });
});

module.exports = router;
