const playerDataHandler = require("./handlePlayerData");
const embedCreator = require("./createEmbed");
const buttonCreator = require("./createButtons");
const errorHandler = require("./handleErrors");

async function skip(interaction, queue, isButton) {
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

  await queue.node.skipTo(trackNumber - 1);

  let Embed;
  if (isButton) {
    Embed = embedCreator.handleButtonEmbed(song, interaction, NowPlaying);
  } else {
    const { embed, nowPlaying } = embedCreator.createTrackEmbed(
      interaction,
      queue,
      false,
      song
    );

    Embed = embed;
    NowPlaying = nowPlaying;
  }

  if (NowPlaying) {
    if (!queue.node.isPlaying()) await queue.node.play();

    await playerDataHandler.handleSkipData(interaction);

    const button = buttonCreator.createButtons(true);

    await interaction.editReply({
      embeds: [Embed],
      components: [button],
    });
  } else {
    await interaction.editReply({
      embeds: [Embed],
    });
  }
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
