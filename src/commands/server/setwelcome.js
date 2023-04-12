const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Moderators, Gigulebalaha, ShadowxRole, HamitzRole } = process.env;
const welcomeSchema = require("../../schemas/welcome-schema");

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
    .setDescription("Set Welcome channel (moderators-only)"),
  async execute(interaction, client) {
    const member = interaction.member;
    const { guild, channel } = interaction;

    let failedEmbed = new EmbedBuilder();

    if (!member.roles.cache.has(Gigulebalaha || ShadowxRole || HamitzRole)) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`You don't have the required role!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
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
    }
  },
};
module.exports.getChannelId = (guildId) => {
  return cache.get(guildId);
};
