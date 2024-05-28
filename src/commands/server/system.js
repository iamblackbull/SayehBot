const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSystemUsage } = require("../../utils/client/handleSystemUsage");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("system")
    .setDescription("Get info about the bot's host server usage"),

  async execute(interaction) {
    const { cpuPercent, memPercent, totalMemoryGB } = await getSystemUsage();

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.system)
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.system)
      .addFields(
        {
          name: "CPU",
          value: `${cpuPercent}%`,
          inline: true,
        },
        {
          name: "RAM (Total)",
          value: `${memPercent}% (${totalMemoryGB} GB)`,
          inline: true,
        }
      )
      .setFooter({
        text: utils.texts.tools,
        iconURL: utils.footers.tools,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
