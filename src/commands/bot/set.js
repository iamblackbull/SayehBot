const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const channelModel = require("../../database/channelModel");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription(
      `${utils.tags.new} ${utils.tags.mod} Set a channel as a special channel`
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select a channel")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Choose a role for your selected channel")
        .setRequired(true)
        .addChoices(
          {
            name: utils.events.welcome,
            value: "welcome",
          },
          {
            name: utils.events.leave,
            value: "leave",
          },
          {
            name: utils.events.boost,
            value: "boost",
          },
          {
            name: utils.events.birthday,
            value: "birthday",
          },
          {
            name: utils.events.stream,
            value: "stream",
          },
          {
            name: utils.events.video,
            value: "video",
          },
          {
            name: utils.events.leave,
            value: "level",
          },
          {
            name: utils.events.mod,
            value: "moderation",
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, options, user } = interaction;
    const channel = options.getChannel("channel") || interaction.channel;
    const role = options.get("role").value;

    let update;
    switch (role) {
      case "welcome":
        update = { welcomeId: channel.id };
        break;
      case "leave":
        update = { leaveId: channel.id };
        break;
      case "boost":
        update = { boostId: channel.id };
        break;
      case "birthday":
        update = { birthdayId: channel.id };
        break;
      case "stream":
        update = { streamId: channel.id };
        break;
      case "video":
        update = { videoId: channel.id };
        break;
      case "level":
        update = { levelId: channel.id };
        break;
      case "moderation":
        update = { moderationId: channel.id };
        break;

      default:
        update = false;
        break;
    }

    await channelModel.findOneAndUpdate(
      {
        guildId: guild.id,
      },
      update,
      {
        upsert: true,
      }
    );

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.profile)
      .setDescription(`Successfully set **${channel}** as ${role} channel.`)
      .setColor(utils.colors.success)
      .setThumbnail(utils.thumbnails.success)
      .setFooter({
        iconURL: utils.footers.bot,
        text: utils.texts.bot,
      });

    console.log(
      `${utils.consoleTags.app} ${user.username} set ${channel.name} as ${role} channel.`
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
