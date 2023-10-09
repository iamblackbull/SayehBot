const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

function createButtons(nowPlaying) {
  const skipButton = new ButtonBuilder()
    .setCustomId(`skip-button`)
    .setEmoji(`⏭`)
    .setDisabled(!nowPlaying)
    .setStyle(ButtonStyle.Secondary);

  const favoriteButton = new ButtonBuilder()
    .setCustomId(`favorite-button`)
    .setEmoji(`🤍`)
    .setDisabled(!nowPlaying)
    .setStyle(ButtonStyle.Danger);

  const lyricsButton = new ButtonBuilder()
    .setCustomId(`lyrics-button`)
    .setEmoji(`🎤`)
    .setDisabled(!nowPlaying)
    .setStyle(ButtonStyle.Primary);

  const replayButton = new ButtonBuilder()
    .setCustomId(`replay-button`)
    .setEmoji(`🔄`)
    .setDisabled(!nowPlaying)
    .setStyle(ButtonStyle.Secondary);

  const button = new ActionRowBuilder()
    .addComponents(skipButton)
    .addComponents(favoriteButton)
    .addComponents(lyricsButton)
    .addComponents(replayButton);

  return button;
}

function createSongButtons() {
  const previousButton = new ButtonBuilder()
    .setCustomId(`previous-button`)
    .setEmoji(`⏮`)
    .setStyle(ButtonStyle.Secondary);

  const pauseButton = new ButtonBuilder()
    .setCustomId(`pause-button`)
    .setEmoji(`⏸`)
    .setStyle(ButtonStyle.Secondary);

  const skipButton = new ButtonBuilder()
    .setCustomId(`skip-button`)
    .setEmoji(`⏭`)
    .setStyle(ButtonStyle.Secondary);

  const favoriteButton = new ButtonBuilder()
    .setCustomId(`favorite-button`)
    .setEmoji(`🤍`)
    .setStyle(ButtonStyle.Danger);

  const lyricsButton = new ButtonBuilder()
    .setCustomId(`lyrics-button`)
    .setEmoji(`🎤`)
    .setStyle(ButtonStyle.Primary);

  const button = new ActionRowBuilder()
    .addComponents(previousButton)
    .addComponents(pauseButton)
    .addComponents(skipButton)
    .addComponents(favoriteButton)
    .addComponents(lyricsButton);

  return button;
}

module.exports = {
  createButtons,
  createSongButtons,
};
