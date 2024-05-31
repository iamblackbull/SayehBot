const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
  guildId: String,
  UserId: String,
  Username: String,
  Warns: Number,
  isApplied: Boolean,
});

module.exports = mongoose.model("warn", warnSchema);
