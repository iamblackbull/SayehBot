const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const welcomeModel = require("../../database/welcomeModel");
const utils = require("../../utils/main/mainUtils");

const cache = new Map();

const loadData = async () => {
  const results = await welcomeModel.find();

  for (const result of results) {
    cache.set(result._id, result.channelId);
  }
};
loadData();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription(`${utils.tags.mod} Set welcome channel of the server`)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, channel } = interaction;

    await welcomeModel.findOneAndUpdate(
      {
        _id: guild.id,
      },
      {
        _id: guild.id,
        channelId: channel.id,
      },
      {
        upsert: true,
      }
    );

    cache.set(guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.profile)
      .setDescription(`Successfully set **${channel}** as Welcome channel.`)
      .setColor(utils.colors.success)
      .setThumbnail(utils.thumbnails.success)
      .setFooter({
        iconURL: utils.footers.moderation,
        text: utils.texts.moderation,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

module.exports.getChannelId = (guildId) => {
  return cache.get(guildId);
};
