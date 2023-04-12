const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  User: String,
  Song1: String,
  Name1: String,
  Song2: String,
  Name2: String,
  Song3: String,
  Name3: String,
  Song4: String,
  Name4: String,
  Song5: String,
  Name5: String,
  Song6: String,
  Name6: String,
  Song7: String,
  Name7: String,
  Song8: String,
  Name8: String,
  Song9: String,
  Name9: String,
  Song10: String,
  Name10: String,
});

module.exports = mongoose.model("favorite", favoriteSchema);
