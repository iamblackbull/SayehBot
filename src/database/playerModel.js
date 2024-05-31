const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  guildId: String,
  isSkipped: Boolean,
  isJustAdded: Boolean,
});

module.exports = mongoose.model("playerDB", playerSchema);
