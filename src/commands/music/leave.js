const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID, Gigulebalaha, ShadowxRole, HamitzRole } = process.env;
let success = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnect and reset the queue"),
  async execute(interaction, client) {
    const member = interaction.member;
    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Queue is empty. Add at least 1 song to the queue to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!interaction.member.voice.channel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You need to be in a voice channel to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (
      !member.roles.cache.has(Gigulebalaha || ShadowxRole || HamitzRole)
    ) {
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
    } else if (
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      let embed = new EmbedBuilder()
        .setTitle(`❎ Leave`)
        .setDescription(`Queue has been cleared.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://icons.veryicon.com/png/o/miscellaneous/programming-software-icons/reset-28.png`
        );

      queue.destroy();

      await interaction.reply({ embeds: [embed] });
      success = true;
    } else {
      failedEmbed
        .setTitle(`**Bot is busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) return;
        else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, 10 * 60 * 1000);
  },
};
