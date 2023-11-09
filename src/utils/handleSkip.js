const playerDataHandler = require("./handlePlayerData");
const embedCreator = require("./createEmbed");
const buttonCreator = require("./createButtons");
const errorHandler = require("./handleErrors");

async function skip(interaction, queue) {
  let trackNumber = interaction.options?.getInteger("position") || false;

  if (trackNumber && trackNumber > queue.tracks.size) {
    trackNumber = queue.tracks.size;
  }

  if (!trackNumber) trackNumber = 1;

  let NowPlaying = false;
  let song;

  if (queue.tracks.size > 0) {
    song = queue.tracks.at(trackNumber - 1);

    NowPlaying = true;
  } else {
    song = queue.currentTrack;
  }

  const { embed, nowPlaying } = embedCreator.createTrackEmbed(
    interaction,
    queue,
    false,
    song
  );

  NowPlaying = nowPlaying;

  const button = buttonCreator.createButtons(NowPlaying);

  if (trackNumber === 1) {
    await queue.node.skip();
  } else {
    await queue.node.skipTo(trackNumber - 1);
  }

  if (NowPlaying) {
    if (!queue.node.isPlaying()) await queue.node.play();

    await playerDataHandler.handleSkipData(interaction);
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

      await playerDataHandler.handleSkipData(interaction);
    } else {
      await queue.node.seek(0);
    }

    const song = queue.currentTrack;

    const { embed, nowPlaying } = embedCreator.createTrackEmbed(
      interaction,
      queue,
      false,
      song
    );

    const button = buttonCreator.createButtons(nowPlaying);

    await interaction.editReply({
      embeds: [embed],
      components: [button],
    });
  } catch (error) {
    errorHandler.handleQueueError(interaction);
  }
}

module.exports = {
  skip,
  previous,
};
