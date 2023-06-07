const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  guild: String,
  VideoId: String,
});

module.exports = mongoose.model("video", videoSchema);
