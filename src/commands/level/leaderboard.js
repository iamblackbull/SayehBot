const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { mongoose } = require("mongoose");
const { getLeaderboard } = require("../../utils/level/handleLevel");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription(`${utils.tags.updated} Get top 10 users in the leaderboard`)
    .setDMPermission(false),

  async execute(interaction) {
    let success = false;
    const leaderboard = await getLeaderboard(interaction.guildId, 10);

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (leaderboard.length < 1) {
      errorHandler.handleLeaderboardError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const leaderboardString = leaderboard
        .map((user, index) => {
          return `**${index + 1}.** ${user.username} \`[${user.level}]\``;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(utils.titles.leaderboard)
        .setColor(utils.colors.default)
        .setDescription(`${leaderboardString}`);

      interaction.editReply({
        embeds: [embed],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, 10);
  },
};
