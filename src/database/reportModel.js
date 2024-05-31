const mongoose = require("mongoose");

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

module.exports = mongoose.model("report", reportSchema);
