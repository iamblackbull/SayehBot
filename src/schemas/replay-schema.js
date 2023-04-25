const mongoose = require("mongoose");

const replaySchema = new mongoose.Schema({
  guild: String,
  Song1: String,
  Name1: String,
  Song2: String,
  Name2: String,
  Song3: String,
  Name3: String,
});

module.exports = mongoose.model("replay", replaySchema);
