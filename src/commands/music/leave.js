const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnect and reset the queue")
    .setDMPermission(false),
  async execute(interaction, client) {
    const voiceChannel = getVoiceConnection(interaction.member.guild.id);

    let failedEmbed = new EmbedBuilder();
    let success = false;

    if (!voiceChannel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`Bot is already not connected to any voice channel.`)
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
      voiceChannel.joinConfig.channelId === interaction.member.voice.channel.id
    ) {
      let embed = new EmbedBuilder()
        .setTitle(`❎ Leave`)
        .setDescription(`Queue has been reset.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://icons.veryicon.com/png/o/miscellaneous/programming-software-icons/reset-28.png`
        );

      const queue = client.player.nodes.get(interaction.guildId);
      if (!queue) {
        voiceChannel.destroy();
      } else {
        queue.delete();
      }

      await interaction.reply({ embeds: [embed] });
      success = true;
    } else {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    }
    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? "Failed to delete Favorite interaction."
      : "Failed to delete unsuccessfull Favorite interaction.";
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) return;
       else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
