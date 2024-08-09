const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  guildId: String,
  basexp: Number,
});

module.exports = mongoose.model("xpModel", levelSchema);
