const mongoose = require("mongoose");
const { applyPenalty } = require("../utils/main/warnPenalty");

const warnSchema = new mongoose.Schema({
  guildId: String,
  UserId: String,
  Username: String,
  Warns: Number,
  isApplied: Boolean,
});

warnSchema.post("save", async function (doc) {
  await applyPenalty(doc.UserId);
});

warnSchema.post("updateOne", async function () {
  await applyPenalty(this.getFilter().UserId);
});

warnSchema.post("findOneAndUpdate", async function (doc) {
  await applyPenalty(doc.UserId);
});

module.exports = mongoose.model("warn", warnSchema);
