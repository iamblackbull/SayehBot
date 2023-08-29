const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `disable`,
  },
  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;

    queue.filters.ffmpeg.setFilters(false);

    console.log(
      `${interaction.commandName} has been triggered and filters have been disabled.`
    );
  },
};
