const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const embedCreator = require("../../utils/createEmbed");
const errorHandler = require("../../utils/handleErrors");
const deletionHandler = require("../../utils/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnect the bot and delete the current queue.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
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
        ////////////// delete queue and leave //////////////
        await queue.delete();

        const embed = embedCreator.createLeaveEmbed();

        await interaction.reply({ embeds: [embed] });
        success = true;
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
