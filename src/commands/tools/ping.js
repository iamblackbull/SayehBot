const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns bot latency"),
    
  async execute(interaction, client) {
    const pingEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let embed = new EmbedBuilder()
      .setTitle(`Ping`)
      .setDescription(
        `Bot Latency: **${client.ws.ping} ms**\nUser Ping: **${
          pingEmbed.createdTimestamp - interaction.createdTimestamp
        } ms**`
      )
      .setColor(0x25bfc4)
      .setThumbnail(
        `https://purepng.com/public/uploads/large/purepng.com-wifi-icon-bluewifi-iconwifiiconwireless-connection-1701528436179cpqjf.png`
      );

    await interaction.editReply({
      embeds: [embed],
    });

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 1 * 60 * 1000);
  },
};
