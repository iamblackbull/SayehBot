const { Schema, model } = require("mongoose");

const favoriteSchema = new Schema({
  User: String,
  Playlist: [
    {
      Url: String,
      Name: String,
      Author: String,
    },
  ],
});

module.exports = model("favorite", favoriteSchema, "favorites");
