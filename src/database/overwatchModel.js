const mongoose = require("mongoose");

const owSchema = new mongoose.Schema({
  User: String,
  Tag: String,
});

module.exports = mongoose.model("overwatch", owSchema);
