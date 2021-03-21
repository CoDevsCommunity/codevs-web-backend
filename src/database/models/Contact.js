const mongoose = require('mongoose');

const ttl = require('mongoose-ttl');

const { Schema, model } = mongoose;

const contactSchema = new Schema({
  ip: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
});

contactSchema.plugin(ttl, { ttl: 604800000 });

module.exports = model('Contact', contactSchema);
