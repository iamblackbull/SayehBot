const { SlashCommandBuilder } = require("discord.js");
const errorHandler = require("../../utils/main/handleErrors");
const { createSongEmbed } = require("../../utils/player/createMusicEmbed");
const deletionHandler = require("../../utils/main/handleDeletion");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a specific moment in the current track")
    .addIntegerOption((options) =>
      options
        .setName("minutes")
        .setDescription("Input the minutes of the moment")
        .setMinValue(1)
        .setRequired(true)
    )
    .addIntegerOption((options) =>
      options
        .setName("seconds")
        .setDescription("Input the seconds of the moment")
        .setMinValue(1)
        .setMaxValue(59)
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    ////////////// base variables //////////////
    const { guildId, member, options } = interaction;
    const queue = client.player.nodes.get(guildId);
    let success = false;

    if (!member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.currentTrack) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId === member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        ////////////// seek through the track //////////////
        const mins = options.getInteger("minutes");
        const seconds = options.getInteger("seconds") || 0;
        let amount = mins * 60 + seconds;

        const song = queue.currentTrack;

        const duration = song.duration;
        const convertor = duration.split(":");

        const maxMins = +convertor[0];
        const maxSecs = +convertor[1];

        if (mins > maxMins) amount = maxMins * 60;
        else if (mins === maxMins && seconds >= maxSecs) amount = maxMins * 60;

        if (maxMins == 0 && maxSecs == 0) {
          await errorHandler.handleLiveTrackError(interaction);
        } else {
          await queue.node.seek(amount * 1000);

          setTimeout(async () => {
            const embed = createSongEmbed(queue, interaction);

            await interaction.editReply({ embeds: [embed] });

            success = true;
          }, 500);
        }
      }
    }

    deletionHandler.handleInteractionDeletion(interaction, success);
  },
};
