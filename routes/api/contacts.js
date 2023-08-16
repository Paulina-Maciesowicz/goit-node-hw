const contactsMethots = require("./contactsMethots.js");
const express = require("express");
const router = express.Router();
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string().alphanum().min(7).max(12).required(),
}).with("username", "birth_year");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsMethots.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const contact = await contactsMethots.getContactById(id);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  } 
});

router.post("/", async (req, res, next) => {
  try {
    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).json({ error: validation.error.message });
      return;
    }
    const contactsAdded = await contactsMethots.addContact(req.body);
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
    if (!contact) {
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
  const contactId = req.params.contactId;
  const body = req.body;
  try {
    const validation = schema.validate(req.body);
    if (validation.error) {
      res.status(400).json({ error: validation.error.message });
    }
    const contact = await contactsMethots.getContactById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    await contactsMethots.updateContact(contactId, body);
    res.status(200).json({ message: "Contact updated" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
