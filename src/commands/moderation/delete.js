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
    .setDescription(`${utils.tags.mod} Delete a specific message in a channel`)
    .addStringOption((options) =>
      options
        .setName("message-id")
        .setDescription("Input the message-id")
        .setRequired(true)
    )
    .addChannelOption((options) =>
      options.setName("channel").setDescription("Choose the message channel")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
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

    console.log(
      `${utils.consoleTags.app} ${interaction.user.username} deleted a messages in ${channel.name}.`
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
