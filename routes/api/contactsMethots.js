const fs = require("fs").promises;
const path = require("path");
const contactsPath = path.join(__dirname, "db", "contacts.json");

async function listContacts() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const contact = contacts.find((c) => c.id === contactId);
  return contact;
}

async function removeContact(contactId) {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const updatedContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  const updatedContactsJSON = JSON.stringify(updatedContacts);

  await fs.writeFile(contactsPath, updatedContactsJSON);
}

async function addContact({ name, email, phone }) {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const lastContact = contacts[contacts.length - 1];
  const newId = parseInt(lastContact.id) + 1;
  const newContact = { id: newId.toString(), name, email, phone };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
  return newContact;
}

async function updateContact(contactId, body) {
  const data = await fs.readFile(contactsPath, "utf-8");
  const contacts = JSON.parse(data);
  const contact = contacts.findIndex((c) => c.id === contactId);
  contacts[contact] = { ...contacts[contact], ...body };
  const updatedContactsJSON = JSON.stringify(contacts);

  await fs.writeFile(contactsPath, updatedContactsJSON);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
