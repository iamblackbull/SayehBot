const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();
const { DBTOKEN, rankChannelID } = process.env;
const Levels = require("discord-xp");
Levels.setURL(DBTOKEN);
const { mongoose } = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Returns top 10 users in the leaderboard")
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let failedEmbed = new EmbedBuilder().setColor(0xffea00);
    let success = false;

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(
          `Connection to database has been timed out.\nTry again later with </leaderboard:1047903144752984069>.`
        )
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      const rawLeaderboard = await Levels.fetchLeaderboard(
        interaction.guild.id,
        10
      );
      if (rawLeaderboard.length < 1) {
        failedEmbed
          .setTitle(`**Action Failed**`)
          .setDescription(`Leaderboard is empty.`)
          .setThumbnail(
            `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        const leaderboard = await Levels.computeLeaderboard(
          client,
          rawLeaderboard
        );
        const leaderboardString = leaderboard
          .map((e) => {
            return `**${e.position}.** ${e.username.toUpperCase()} \`[${
              e.level
            }]\``;
          })
          .join("\n");

        let embed = new EmbedBuilder()
          .setTitle("🎖 Leaderboard")
          .setColor(0x25bfc4)
          .setDescription(`${leaderboardString}`);

        interaction.editReply({
          embeds: [embed],
        });
        success = true;
      }
    }
    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? "Failed to delete Leaderboard interaction."
      : "Failed to delete unsuccessfull Leaderboard interaction.";
    setTimeout(() => {
      if (success && interaction.channel.id === rankChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
