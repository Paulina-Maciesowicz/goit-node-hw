const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join(__dirname, "db", "contacts.json");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string().alphanum().min(7).max(12).required(),
}).with("username", "birth_year");

async function listContacts() {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    console.error(error);
  }
}

async function getContactById(contactId) {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((c) => c.id === contactId);
    if (contact === undefined) {
      return `id ${contactId} not found`;
    }
    return contact;
  } catch (error) {
    console.error(error);
  }
}

async function removeContact(contactId) {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((c) => c.id === contactId);
    const updatedContacts = contacts.filter(
      (contact) => contact.id !== contactId
    );
    if (contact === undefined) {
      return `id ${contactId} not found`;
    }
    const updatedContactsJSON = JSON.stringify(updatedContacts);

    await fs.writeFile(contactsPath, updatedContactsJSON);
  } catch (error) {
    console.error(error);
  }
}

async function addContact(name, email, phone) {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const lastContact = contacts[contacts.length - 1];
    const newId = parseInt(lastContact.id) + 1;
    const newContact = { id: newId.toString(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return newContact;
  } catch (error) {
    console.error(error);
  }
}

async function updateContact(contactId, body) {
  schema.validate(body);
  console.log(schema.validate(body));

  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.findIndex((c) => c.id === contactId);
    console.log(contact);
    const validation = schema.validate(body);
    if (validation.error) {
      console.log(validation.error.message);
      throw new Error(`Validation error: ${validation.error.message}`);
    }
    if (contact === undefined) {
      return `id ${contactId} not found`;
    }
    contacts[contact] = { ...contacts[contact], ...body };
    const updatedContactsJSON = JSON.stringify(contacts);

    await fs.writeFile(contactsPath, updatedContactsJSON);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
