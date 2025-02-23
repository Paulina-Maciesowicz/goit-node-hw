const contactsMethots = require("./contactsMethods.js");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../middlewares/auth.js");

const schemaPost = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string().alphanum().min(7).max(12).required(),
  favorite: Joi.boolean().required(),
});

const schemaPut = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string().alphanum().min(7).max(12),
  favorite: Joi.boolean(),
});

const schemaPatch = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/", auth, async (req, res, next) => {
  try {
    const contacts = await contactsMethots.listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const contact = await contactsMethots.getContactById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const validation = schemaPost.validate(req.body);
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

router.delete("/:contactId", auth, async (req, res, next) => {
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

router.put("/:contactId", auth, async (req, res, next) => {
  const contactId = req.params.contactId;
  const body = req.body;
  try {
    const validation = schemaPut.validate(req.body);
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

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  const contactId = req.params.contactId;
  const body = req.body.favorite;
  try {
    const validation = schemaPatch.validate(req.body);
    if (validation.error) {
      res.status(400).json({ error: "missing field favorite" });
    }
    const contact = await contactsMethots.getContactById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    await contactsMethots.updateFavorite(contactId, body);

    res.status(200).json({ message: "Contact updated" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
