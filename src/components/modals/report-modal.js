require("dotenv").config();
const { guildID, modChannelID } = process.env;
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `report-modal`,
  },
  async execute(interaction, client) {
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = await guild.channels
      .fetch(`909466284050227220`)
      .catch(console.error);
    const message = interaction.fields.getTextInputValue(`ReportInput`);
    const target = await interaction.channel.messages.fetch(
      interaction.targetId
    );
    const user = interaction.user;
    const avatar = user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(`📄 Report Case`)
      .setDescription(`**Reason :**\n${message}`)
      .setThumbnail(`${avatar}`)
      .addFields(
        { name: `Reporter`, value: `${user}`, inline: true },
        { name: `Target`, value: `<@${target}>`, inline: true }
      )
      .setTimestamp(Date.now())
      .setColor(0xff0000);

    await channel.send({
      content: `Hey moderators , a new report case opened ❗`,
      embeds: [embed],
    });
    await interaction.reply({
      content: `✅ Thanks for submitting your report. Moderators will answer as soon as possible.`,
      ephemeral: true,
    });
    console.log(
      `${interaction.user.tag} Reported <@${target}> . reason : ${message}`
    );
  },
};
