const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
  guildId: String,
  UserId: String,
  Username: String,
  Warns: Number,
  isApplied: Boolean,
});

warnSchema.post("save", function (doc) {
  console.log("new schema saved!", doc.Username);
});

warnSchema.post("updateOne", function () {
  console.log("schema updated!", this.getUpdate().$set.Username);
});

module.exports = mongoose.model("warn", warnSchema);
