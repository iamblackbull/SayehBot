const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const osu = require("node-os-utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("system")
    .setDescription("Get info about host server usage."),
  async execute(interaction, client) {
    const cpuUsage = await osu.cpu.usage();
    const memInfo = await osu.mem.info();

    const freeMemory = memInfo.freeMemMb;
    const totalMemory = memInfo.totalMemMb;
    const usedMemory = totalMemory - freeMemory;

    const cpuPercent = cpuUsage.toFixed(2);
    const memPercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    const totalMemoryGB = (totalMemory / 1024).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle(`💻 System`)
      .setColor(0x25bfc4)
      .setThumbnail("https://i.imgur.com/UD49B9U.png")
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
      );

    await interaction.reply({
      embeds: [embed],
    });

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 1 * 60 * 1000);
  },
};
