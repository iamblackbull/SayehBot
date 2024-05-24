const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
  guildId: String,
  MemberAdd: Boolean,
  MemberRemove: Boolean,
  MemberUpdate: Boolean,
  Birthday: Boolean,
  Stream: Boolean,
  Video: Boolean,
  Level: Boolean,
  Moderation: Boolean,
});

module.exports = mongoose.model("events", eventsSchema, "events");
