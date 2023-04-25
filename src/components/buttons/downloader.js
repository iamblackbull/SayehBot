const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const downloader = require("@discord-player/downloader").Downloader;
const fs = require("fs");

module.exports = {
  data: {
    name: `downloader`,
  },
  async execute(interaction, client) {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue) return;

    const url = queue.current.url;

    const stream = downloader.download(url);
    stream.pipe(
      fs.createWriteStream(`../../donwloads/${queue.current.title}.mp3`)
    );

    const stats = fs.statSync(`../../donwloads/${queue.current.title}.mp3`);
    const fileSizeInMegabytes = stats.size / (1024 * 1024);

    if (fileSizeInMegabytes > 25) {
      fs.unlinkSync(`../../donwloades/${queue.current.title}.mp3`);

      const embed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(`File is too large to upload.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else {
      const attachment = new AttachmentBuilder(
        `../../downloads/${queue.current.title}.mp3`
      );
      await interaction.reply({
        files: [attachment],
      });
      fs.unlinkSync(`../../donwloades/${queue.current.title}.mp3`);

      setTimeout(() => {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete Download button interaction.`);
        });
      }, 10 * 60 * 1000);
    }
  },
};
