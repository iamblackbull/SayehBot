const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Disconnect the bot and delete the current queue.")
    .setDMPermission(false),

  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);

    const sameChannel =
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id;

    let failedEmbed = new EmbedBuilder();
    let success = false;

    if (!queue || !queue.connection) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Bot is already not playing in any voice channel.\nUse </play:1047903145071759425> to play a track.`
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
    } else if (!sameChannel) {
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
    } else {
      let embed = new EmbedBuilder()
        .setTitle(`❎ Leave`)
        .setDescription(`Queue has been reset.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://icons.veryicon.com/png/o/miscellaneous/programming-software-icons/reset-28.png`
        );

      queue.delete();

      await interaction.reply({ embeds: [embed] });

      success = true;
    }

    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
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
