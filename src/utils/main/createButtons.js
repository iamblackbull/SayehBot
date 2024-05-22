const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { buttons } = require("../player/musicUtils");

function createBookmarkButton(customId) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel("Bookmark")
    .setEmoji(buttons.bookmark)
    .setStyle(ButtonStyle.Primary);
}

function createButton(customId, emoji, style, disabled) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setEmoji(emoji)
    .setStyle(style)
    .setDisabled(disabled);
}

function createButtons(nowPlaying) {
  const buttonsConfig = [
    ["previous-button", buttons.previous, ButtonStyle.Secondary],
    ["pause-button", buttons.pause, ButtonStyle.Secondary],
    ["skip-button", buttons.skip, ButtonStyle.Secondary],
    ["shuffle-button", buttons.shuffle, ButtonStyle.Secondary],
    ["favorite-button", buttons.favorite, ButtonStyle.Danger],
  ];

  const components = buttonsConfig.map(([customId, emoji, style]) =>
    createButton(customId, emoji, style, !nowPlaying)
  );

  const button = new ActionRowBuilder().addComponents(...components);

  return button;
}

function createPauseButton() {
  const pauseButton = createButton(
    "pause-button",
    buttons.pause,
    ButtonStyle.Secondary,
    false
  );

  const button = new ActionRowBuilder().addComponents(pauseButton);

  return button;
}

function createShuffleButton() {
  const shuffleButton = createButton(
    "shuffle-button",
    buttons.shuffle,
    ButtonStyle.Secondary,
    false
  );

  const button = new ActionRowBuilder().addComponents(shuffleButton);

  return button;
}

function createFavoriteButtons() {
  const playButton = createButton(
    "play-button",
    buttons.play,
    ButtonStyle.Secondary,
    false
  );
  const favoriteButton = createButton(
    "favorite-result-button",
    buttons.favorite,
    ButtonStyle.Danger,
    false
  );

  const button = new ActionRowBuilder().addComponents(
    playButton,
    favoriteButton
  );

  return button;
}

function createWarningButtons() {
  const continueButton = new ButtonBuilder()
    .setCustomId("continue")
    .setLabel("Continue")
    .setStyle(ButtonStyle.Success);
  const cancelButton = new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);

  const button = new ActionRowBuilder()
    .addComponents(cancelButton)
    .addComponents(continueButton);

  return button;
}

function createUrlButton(label, url) {
  const urlButton = new ButtonBuilder()
    .setLabel(label)
    .setURL(url)
    .setStyle(ButtonStyle.Link);

  return urlButton;
}

function createGameButtons(customId, recentRunUrl, bestRunUrl) {
  const bookmarkButton = createBookmarkButton(customId);

  const button = new ActionRowBuilder().addComponents(bookmarkButton);

  if (recentRunUrl && bestRunUrl) {
    const recentRunButton = new ButtonBuilder()
      .setLabel("M+ Recent Run")
      .setURL(recentRunUrl)
      .setStyle(ButtonStyle.Link);

    const bestRunButton = new ButtonBuilder()
      .setLabel("M+ Best Run")
      .setURL(bestRunUrl)
      .setStyle(ButtonStyle.Link);

    button.addComponents(recentRunButton).addComponents(bestRunButton);
  }

  return button;
}

module.exports = {
  createButtons,
  createPauseButton,
  createShuffleButton,
  createFavoriteButtons,
  createWarningButtons,
  createUrlButton,
  createGameButtons,
};
