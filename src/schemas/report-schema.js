const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  CaseId: String,
  ReporterId: String,
  ReporterName: String,
  TargetId: String,
  TargetName: String,
  Message: String,
  IsCaseOpen: Boolean,
});

module.exports = mongoose.model("report", reportSchema);
