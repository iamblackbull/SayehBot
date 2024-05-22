const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  guild: String,
  Streamer: String,
  IsLive: Boolean,
});

module.exports = mongoose.model("stream", streamSchema);
