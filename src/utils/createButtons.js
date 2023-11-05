const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { buttons } = require("./musicUtils");

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
    ["favorite-button", buttons.favorite, ButtonStyle.Danger],
    ["lyrics-button", buttons.lyrics, ButtonStyle.Primary],
  ];

  const components = buttonsConfig.map(([customId, emoji, style]) =>
    createButton(customId, emoji, style, !nowPlaying)
  );

  const button = new ActionRowBuilder().addComponents(...components);

  return button;
}

function createPauseButtons() {
  const pauseButton = createButton(
    "pause-button",
    buttons.pause,
    ButtonStyle.Secondary,
    false
  );

  const button = new ActionRowBuilder().addComponents(pauseButton);

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

module.exports = {
  createButtons,
  createPauseButtons,
  createFavoriteButtons,
  createWarningButtons,
};
