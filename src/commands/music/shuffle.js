const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),
  async execute(interaction, client) {

    const queue = client.player.getQueue(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;

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
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      const embed = new EmbedBuilder()
        .setTitle(`Shuffle`)
        .setDescription(
          `Queue of ${queue.tracks.length} songs have been shuffled!`
        )
        .setColor(0x25bfc4)
        .setThumbnail(
          `https://png.pngtree.com/png-vector/20230228/ourmid/pngtree-shuffle-vector-png-image_6622846.png`
        );
      queue.shuffle();
      await interaction.reply({
        embeds: [embed],
      });
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
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) return;
        else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Shuffle interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Shuffle interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
