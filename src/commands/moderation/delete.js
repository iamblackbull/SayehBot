const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const errorHandler = require("../../utils/main/handleErrors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a message by their message-id.")
    .addStringOption((options) => {
      return options
        .setName("message-id")
        .setDescription("Input the message-id to delete.")
        .setRequired(true);
    })
    .addChannelOption((options) => {
      return options
        .setName("channel")
        .setDescription("Choose the message channel to delete.");
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    const messageId = interaction.options.getInteger("message-id");
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    await channel.messages.delete(messageId).catch(async (error) => {
      if (error.code == 10008) {
        await errorHandler.handleDeleteError(interaction);
      } else {
        await errorHandler.handleUnknownError(interaction);
      }
    });

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.delete)
      .setDescription("Message successfully deleted.")
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.delete)
      .setFooter({
        text: utils.texts.moderation,
        iconURL: utils.footers.moderation,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
