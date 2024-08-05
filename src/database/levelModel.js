const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  username: String,
  level: Number,
  xp: Number,
  totalxp: Number,
});

module.exports = mongoose.model("level", levelSchema);
