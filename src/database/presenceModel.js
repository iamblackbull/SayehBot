const mongoose = require("mongoose");

const presenceSchema = new mongoose.Schema({
  GuildId: String,
  Author: String,
  Name: String,
  Type: Number,
  Status: String,
});

module.exports = mongoose.model("presence", presenceSchema);
