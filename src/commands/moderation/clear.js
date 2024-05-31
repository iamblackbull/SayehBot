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
    .setDescription(`${utils.tags.mod} Clear the latest messages in a channel`)
    .addIntegerOption((options) =>
      options
        .setName("amount")
        .setDescription("Input the amount of messages to clear")
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true)
    )
    .addChannelOption((options) =>
      options
        .setName("channel")
        .setDescription("Choose a channel to clear messages in")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
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

    console.log(
      `${utils.consoleTags.app} ${interaction.user.username} cleared ${amount} messages in ${channel.name}.`
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
