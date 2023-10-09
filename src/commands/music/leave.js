const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
const errorHandler = require("../../functions/handlers/handleErrors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnect the bot and delete the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);
    let success = false;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.connection) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        queue.delete();

        const embed = new EmbedBuilder()
          .setTitle(`❎ Leave`)
          .setDescription(`Queue has been reset.`)
          .setColor(0x256fc4)
          .setThumbnail(
            `https://icons.veryicon.com/png/o/miscellaneous/programming-software-icons/reset-28.png`
          );

        await interaction.reply({ embeds: [embed] });
        success = true;
      }
    }
    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
