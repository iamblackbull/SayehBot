const mongoose = require("mongoose");

const replaySchema = new mongoose.Schema({
  guild: String,
  Song: String,
  Name: String,
});

module.exports = mongoose.model("replay", replaySchema);
