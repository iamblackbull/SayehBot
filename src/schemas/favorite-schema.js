const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  User: String,
  Playlist: [
    {
      Url: String,
    },
  ],
});

module.exports = mongoose.model("favorite", favoriteSchema);
