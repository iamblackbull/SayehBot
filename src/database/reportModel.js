const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  CaseId: String,
  CaseMessageId: String,
  ReporterId: String,
  ReporterName: String,
  TargetId: String,
  TargetName: String,
  Message: String,
  MessageId: String,
  IsCaseOpen: Boolean,
  IsModsNotified: Boolean,
  IsReporterNotified: Boolean,
});

module.exports = mongoose.model("report", reportSchema);
