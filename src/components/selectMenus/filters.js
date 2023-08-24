const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: {
    name: `filters`,
  },
  async execute(interaction, client) {
    console.log("Filters select menu has been triggered.")
  },
};
