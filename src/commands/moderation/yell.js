const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yell")
    .setDescription(`${utils.tags.mod} Yell at @everyone in a channel`)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select a channel")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Input a message to announce")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const { options, user } = interaction;
    const channel = options.getChannel("channel");
    const message = options.getString("message");
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.yell)
      .setDescription("Message has been sent successfully.")
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.success)
      .setFooter({
        iconURL: utils.footers.tools,
        text: utils.texts.tools,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

    const announcement = new EmbedBuilder()
      .setAuthor({
        iconURL: avatar,
        name: user.globalName,
      })
      .setTitle(utils.titles.announce)
      .setDescription(message)
      .setColor(utils.colors.default);

    await channel.send({
      content: `📢 Hey ${utils.tag} , ${user} yells:`,
      embeds: [announcement],
    });
  },
};
