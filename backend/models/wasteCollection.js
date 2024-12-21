const mongoose = require('mongoose');

const WasteCollectionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  emails: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model('WasteCollection', WasteCollectionSchema);

  