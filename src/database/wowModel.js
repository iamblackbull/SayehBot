const mongoose = require("mongoose");

const wowSchema = new mongoose.Schema({
  User: String,
  WowCharacter: String,
  WowRealm: String,
  WowRegion: String,
});

module.exports = mongoose.model("wow", wowSchema);