const { handleSkipData } = require("./handlePlayerData");
const { createTrackEmbed } = require("./createMusicEmbed");
const { createButtons } = require("../main/createButtons");
const { handleQueueError } = require("../main/handleErrors");
const { titles } = require("./musicUtils");

async function skip(interaction, queue) {
  let trackNumber = interaction.options?.getInteger("position") || false;
  if (trackNumber && trackNumber > queue.tracks.size) {
    trackNumber = queue.tracks.size;
  }

  let song;
  if (queue.tracks.size > 0) {
    const target = trackNumber ? trackNumber - 1 : 0;

    song = queue.tracks.at(target);
  } else {
    song = queue.currentTrack;
  }

  const { embed, nowPlaying } = createTrackEmbed(
    interaction,
    queue,
    false,
    song
  );

  const button = createButtons(nowPlaying);

  if (!trackNumber) {
    await queue.node.skip();
  } else {
    await queue.node.skipTo(trackNumber - 1);
  }

  if (nowPlaying) {
    if (!queue.node.isPlaying()) await queue.node.play();

    await handleSkipData(interaction.guildId);
  }

  await interaction.editReply({
    embeds: [embed],
    components: [button],
  });
}

async function previous(interaction, queue, previous) {
  try {
    if (previous) {
      await queue.history.back();

      await handleSkipData(interaction.guildId);
    } else {
      await queue.node.seek(0);
    }

    const song = queue.currentTrack;

    const { embed, nowPlaying } = createTrackEmbed(
      interaction,
      queue,
      false,
      song
    );

    if (!previous) {
      embed.setTitle(titles.replay);
    }

    const button = createButtons(nowPlaying);

    await interaction.editReply({
      embeds: [embed],
      components: [button],
    });
  } catch (error) {
    handleQueueError(interaction);
  }
}

module.exports = {
  skip,
  previous,
};
