const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const welcomeSchema = require("../../database/welcomeModel");

const cache = new Map();

const loadData = async () => {
  const results = await welcomeSchema.find();

  for (const result of results) {
    cache.set(result._id, result.channelId);
  }
};
loadData();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Set Welcome channel of server")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(interaction, client) {
    const { guild, channel } = interaction;

      await welcomeSchema.findOneAndUpdate(
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

      let embed = new EmbedBuilder()
        .setTitle(`Welcome Channel`)
        .setDescription(`Successfully set **${channel}** as Welcome channel.`)
        .setColor(0x25bfc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/4856/4856668.png`
        );

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    
  },
};

module.exports.getChannelId = (guildId) => {
  return cache.get(guildId);
};
