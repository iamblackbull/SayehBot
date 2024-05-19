const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");
const errorHandler = require("../../utils/main/handleErrors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear the latest messages in a channel.")
    .addIntegerOption((options) => {
      return options
        .setName("amount")
        .setMinValue(1)
        .setMaxValue(99)
        .setDescription("Input the amount of messages you want to clear.")
        .setRequired(true);
    })
    .addChannelOption((options) => {
      return options
        .setName("channel")
        .setDescription("Choose a channel to clear their messages.");
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger("amount");
    const channel =
      interaction.options.getChannel("channel") || interaction.channel;

    await channel.bulkDelete(amount).catch(async (error) => {
      if (error.code && error.code == 50034) {
        await errorHandler.handleBulkError(interaction);
      } else {
        await errorHandler.handleUnknownError(interaction);
      }
    });

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.clear)
      .setDescription(`**${amount}** messages successfully cleared.`)
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.clear)
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
