const mongoose = require("mongoose");
const reportHandler = require("../utils/main/handleReports");

const reportSchema = new mongoose.Schema({
  CaseId: String,
  CaseMessageId: String,
  ReporterId: String,
  ReporterName: String,
  TargetId: String,
  TargetName: String,
  Message: String,
  Reason: String,
  MessageId: String,
  ChannelId: String,
  IsCaseClosed: Boolean,
  IsModsNotified: Boolean,
  IsReporterNotified: Boolean,
  Action: String,
});

reportSchema.post("save", async function (doc) {
  await reportHandler.notifyModeratos(doc);
});

reportSchema.post("updateOne", async function () {
  const isCaseClosed = this.getUpdate().$set.IsCaseClosed;

  if (isCaseClosed) {
    await reportHandler.notifyReporter(this.getFilter().CaseId);
  }
});

module.exports = mongoose.model("report", reportSchema);
