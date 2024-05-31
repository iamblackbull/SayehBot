const mongoose = require("mongoose");

const apexSchema = new mongoose.Schema({
  User: String,
  ApexUsername: String,
  ApexPlatform: String,
});

module.exports = mongoose.model("apex", apexSchema);
