const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const downloader = require("@discord-player/downloader").Downloader;
const fs = require("fs");

module.exports = {
  data: {
    name: `downloader`,
  },
  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);
    if (!queue) return;

    let embed = new EmbedBuilder()
      .setTitle(`**Processing ...**`)
      .setDescription(`Bot is exporting your file...\nPlease wait.`)
      .setColor(0x256fc4)
      .setThumbnail(
        `https://cdn4.iconfinder.com/data/icons/3d-modeling-printing-volume-2/64/file-processing-512.png`
      );

    await interaction.reply({
      embeds: [embed],
    });

    const url = queue.currentTrack.url;
    const valid = downloader.validate(url);

    if (!valid) {
      embed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(`Unable to validate this track's url.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );

      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      const stream = downloader.download(url);

      stream.pipe(fs.createWriteStream(`./${interaction.user.id}.mp3`));

      stream.once("finish", async () => {
        const stats = fs.statSync(`./${interaction.user.id}.mp3`);

        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = stats.size / (1024 * 1024);

        if (fileSizeInBytes == 0) {
          fs.unlinkSync(`./${interaction.user.id}.mp3`);

          embed = new EmbedBuilder()
            .setTitle(`**Action Failed**`)
            .setDescription(
              `Failed to export file. Track's publisher may have blocked this process.`
            )
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            );

          await interaction.editReply({
            embeds: [embed],
          });
        } else if (fileSizeInMegabytes > 25) {
          fs.unlinkSync(`./${interaction.user.id}.mp3`);

          embed = new EmbedBuilder()
            .setTitle(`**Action Failed**`)
            .setDescription(`File is too large to upload.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            );

          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          const attachment = new AttachmentBuilder(
            `./${interaction.user.id}.mp3`
          );

          await interaction.editReply({
            embeds: [],
            files: [attachment],
          });

          fs.unlinkSync(`./${interaction.user.id}.mp3`);
        }
      });
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(
          `Failed to delete ${interaction.commandName} button interaction.`
        );
      });
    }, 10 * 60 * 1000);
  },
};
