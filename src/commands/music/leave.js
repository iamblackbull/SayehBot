const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { tags } = require("../../utils/main/mainUtils");
const errorHandler = require("../../utils/main/handleErrors");
const { createLeaveEmbed } = require("../../utils/player/createMusicEmbed");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription(`${tags.mod} Disconnect the bot`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const queue = client.player.nodes.get(interaction.guildId);
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
        ////////////// delete queue and leave //////////////
        await queue.delete();

        const embed = createLeaveEmbed();

        await interaction.reply({ embeds: [embed] });
        success = true;
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
