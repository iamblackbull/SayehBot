const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");
const buttonCreator = require("../../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDescription("Get info about the current track.")
    .setDMPermission(false),

  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);

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

        const { timestamp } = useTimeline(interaction.guildId);

        const bar = queue.node.createProgressBar({
          timecodes: true,
          queue: false,
          length: 14,
        });

        const song = queue.currentTrack;

        const embed = new EmbedBuilder()
          .setTitle("🎵 **Currently Playing**")
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
          )
          .setColor(0x25bfc4);

        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          const totalTimer = +convertor[0] * 60 + +convertor[1];

          const currentDuration = timestamp.current.label;
          const currentConvertor = currentDuration.split(":");
          const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

          timer = totalTimer - currentTimer;
        }

        const button = buttonCreator.createSongButtons();

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
