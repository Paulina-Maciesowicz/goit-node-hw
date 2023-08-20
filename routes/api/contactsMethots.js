const contact = require("../../models/contact.model");

async function listContacts() {

  return contact.find();
}

async function getContactById(contactId) {
  return contact.findById(contactId);
}

async function removeContact(contactId) {
  return contact.findByIdAndDelete(contactId);
}

async function addContact({ name, email, phone, favorite }) {
  return contact.create({ name, email, phone, favorite });
}

async function updateContact(contactId, body) {
  return contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
}

async function updateFavorite(contactId, favorite) {
  return contact.findByIdAndUpdate(
    contactId,
    { favorite },
    {
      new: true,
    }
  );
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
};
