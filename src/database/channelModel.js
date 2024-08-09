const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  guildId: String,
  welcomeId: String,
  leaveId: String,
  boostId: String,
  birthdayId: String,
  streamId: String,
  videoId: String,
  levelId: String,
  moderationId: String,
});

module.exports = mongoose.model("channels", channelSchema, "channels");
