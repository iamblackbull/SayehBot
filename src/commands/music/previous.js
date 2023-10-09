const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;
const errorHandler = require("../../functions/handlers/handleErrors");
const footerSetter = require("../utils/setFooter");
const buttonCreator = require("../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previously played track in the current queue."),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;
    let timer;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      errorHandler.handlePermissionError(interaction);
    } else if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.history) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        let embed = new EmbedBuilder();
        let nowPlaying = false;

        await queue.history.back();

        let queueSize = queue.tracks.size;

        if (!queue.node.isPlaying()) {
          queueSize = 0;
          await queue.node.play();
        }

        nowPlaying = queueSize === 0;

        if (nowPlaying) {
          embed.title(`🎵 Now Playing`);

          await playerDB.updateOne(
            { guildId: interaction.guildId },
            { isSkipped: true }
          );
        } else {
          embed.setTitle(`🎵 Previous`);

          await playerDB.updateOne(
            { guildId: interaction.guildId },
            { isSkipped: false }
          );
        }

        const song = queue.currentTrack;

        embed
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

        const button = buttonCreator.createButtons(nowPlaying);

        await interaction.editReply({
          embeds: [embed],
          components: [button],
        });
        success = true;
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
