const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { DBTOKEN, rankChannelID } = process.env;
const { mongoose } = require("mongoose");
const errorHandler = require("../../utils/main/handleErrors");
const utils = require("../../utils/main/mainUtils");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const Levels = require("discord-xp");

Levels.setURL(DBTOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Get top 10 users in the leaderboard")
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    const rawLeaderboard = await Levels.fetchLeaderboard(
      interaction.guild.id,
      10
    );

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (rawLeaderboard.length < 1) {
      errorHandler.handleLeaderboardError(interaction);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const leaderboard = await Levels.computeLeaderboard(
        client,
        rawLeaderboard
      );

      const leaderboardString = leaderboard
        .map((user) => {
          return `**${user.position}.** ${user.username} \`[${user.level}]\``;
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

    handleNonMusicalDeletion(interaction, success, rankChannelID, 5);
  },
};
