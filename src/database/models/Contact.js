const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const ttl = require('mongoose-ttl')

const contactSchema = new Schema({
    ip: String,
    fullName: String,
    affair: String,
    email: String,
    message: String, 
});

contactSchema.plugin(ttl, {ttl: 604800000})



module.exports = model('Contact', contactSchema);