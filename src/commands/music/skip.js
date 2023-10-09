const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current track.")
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;
    let timer;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.node.isPlaying()) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        let embed = new EmbedBuilder().setColor(0xc42525);

        const previousSong = queue.currentTrack;

        await queue.node.skip();

        const song = queue.tracks.at(0) || null;

        if (song == null || !song) {
          embed
            .setTitle("⏭ **Skipped**")
            .setDescription(
              `**[${previousSong.title}](${previousSong.url})**\n**${previousSong.author}**`
            )
            .setThumbnail(previousSong.thumbnail);

          await interaction.editReply({
            embeds: [embed],
          });

          success = true;
          timer = 2 * 60;
        } else {
          if (!queue.node.isPlaying()) await queue.node.play();

          await playerDB.updateOne(
            { guildId: interaction.guildId },
            { isSkipped: true }
          );

          embed
            .setTitle("🎵 **Playing Next**")
            .setDescription(
              `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
            )
            .setThumbnail(song.thumbnail);

          footerSetter.setFooter(embed, song);

          if (song.duration.length >= 7) {
            timer = 10 * 60;
          } else {
            const duration = song.duration;
            const convertor = duration.split(":");
            timer = +convertor[0] * 60 + +convertor[1];
          }

          const button = buttonCreator.createButtons(true);

          await interaction.editReply({
            embeds: [embed],
            components: [button],
          });
          success = true;
        }
      }
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({ components: [] });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
