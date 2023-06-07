const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  ReporterId: String,
  ReporterName: String,
  TargetId: String,
  TargetName: String,
  Message: String,
  IsCaseOpen: Boolean,
});

module.exports = mongoose.model("report", reportSchema);