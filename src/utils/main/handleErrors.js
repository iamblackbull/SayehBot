const { EmbedBuilder } = require("discord.js");
const { titles, colors, thumbnails, formatsLabel } = require("./mainUtils");
const musicUtils = require("../player/musicUtils");

const warningEmbed = new EmbedBuilder()
  .setColor(colors.warning)
  .setThumbnail(thumbnails.warning);

async function handleDatabaseError(interaction) {
  const databaseError = new EmbedBuilder()
    .setTitle(`**Connection Timed out!**`)
    .setDescription("Connection to database has been timed out.")
    .setColor(colors.warning)
    .setThumbnail(thumbnails.connection_error);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [databaseError],
    });
  } else {
    await interaction.reply({
      embeds: [databaseError],
      ephemeral: interaction.customId?.includes("favorite-button"),
    });
  }
}

async function handleStreamModeError(interaction) {
  warningEmbed
    .setTitle("**Bot is in Stream Mode.**")
    .setDescription(
      "You cannot perform this action while the bot is in stream mode."
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleBulkError(interaction) {
  const tag = `</${interaction.commandName}:${interaction.commandId}>`;

  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription(
      `You can only clear messages that are under **14** days old.\nTry again with ${tag}.`
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleDeleteError(interaction) {
  const tag = `</${interaction.commandName}:${interaction.commandId}>`;

  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription(
      `Message might be too old or you are not using this command in the same channel or you have provided a wrong channel.\nTry again with ${tag}.`
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handlePermissionError(interaction) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription("Bot doesn't have the required permission!");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handlePermissionErrorMessage(message) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription("Bot doesn't have the required permission!");

  const msg = await message.reply({
    embeds: [warningEmbed],
  });

  return msg;
}

async function handleWarnError(interaction) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription("Unable to warn this user.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleVoiceChannelError(interaction) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription("You need to be in a voice channel to use this command.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleVoiceChannelErrorMessage(message) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription("You need to be in a voice channel to use this command.");

  const msg = await message.reply({
    embeds: [warningEmbed],
  });

  return msg;
}

async function handleQueueError(interaction) {
  warningEmbed
    .setTitle(titles.action_failed)
    .setDescription(
      "There is no queue, queue is empty or queue history is not available."
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

const noResultError = new EmbedBuilder()
  .setTitle("**No Result**")
  .setDescription("Make sure you input a valid query.")
  .setColor(colors.warning)
  .setThumbnail(thumbnails.no_results);

async function handleNoResultError(interaction) {
  const tag = `</${interaction.commandName}:${interaction.commandId}>`;

  const description =
    interaction.commandName === "wow"
      ? noResultError.setDescription(
          `- Make sure you input the correct information.\n- Character's profile must be available in **[raider.io](https://raider.io).**\nTry again with ${tag}.`
        )
      : `Make sure you input a valid query.\nTry again with ${tag}.`;

  noResultError.setDescription(description);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [noResultError],
    });
  } else {
    await interaction.reply({
      embeds: [noResultError],
    });
  }
}

async function handleNoResultErrorMessage(message) {
  const msg = await message.reply({
    embeds: [noResultError],
  });

  return msg;
}

const busyError = new EmbedBuilder()
  .setTitle("**Busy**")
  .setDescription("Bot is playing a music in another voice channel.")
  .setColor(colors.default)
  .setThumbnail(thumbnails.busy);

async function handleBusyError(interaction) {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [busyError],
    });
  } else {
    await interaction.reply({
      embeds: [busyError],
    });
  }
}

async function handleBusyErrorMessage(message) {
  const msg = await message.reply({
    embeds: [busyError],
  });

  return msg;
}

const restriceError = new EmbedBuilder()
  .setTitle("**Age / Sensitive restriction**")
  .setDescription(
    "Track is not playable due to age limitation or sensitive content restriction."
  )
  .setColor(colors.warning)
  .setThumbnail(thumbnails.warning);

async function handleRestriceError(interaction) {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [restriceError],
    });
  } else {
    await interaction.reply({
      embeds: [restriceError],
    });
  }
}

async function handleRestriceErrorMessage(message) {
  const msg = await message.reply({
    embeds: [restriceError],
  });

  return msg;
}

const thirdPartyError = new EmbedBuilder()
  .setTitle("**Third-Party Error**")
  .setDescription(
    "Track found but unable to retrieve audio data due to third-party package failure."
  )
  .setColor(colors.warning)
  .setThumbnail(thumbnails.warning);

async function handleThirdPartyError(interaction) {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [thirdPartyError],
    });
  } else {
    await interaction.reply({
      embeds: [thirdPartyError],
    });
  }
}

async function handleThirdPartyErrorMessage(message) {
  const msg = await message.reply({
    embeds: [thirdPartyError],
  });

  return msg;
}

const unknownError = new EmbedBuilder()
  .setTitle("**Unknown Error**")
  .setDescription("An Unknown error occurred.")
  .setColor(colors.error)
  .setThumbnail(thumbnails.error);

async function handleUnknownError(interaction) {
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [unknownError],
    });
  } else {
    await interaction.reply({
      embeds: [unknownError],
      ephemeral: interaction.customId?.includes("favorite-button"),
    });
  }
}

async function handleUnknownErrorMessage(message) {
  const msg = await message.reply({
    embeds: [unknownError],
  });

  return msg;
}

async function handleEmptyPlaylistError(interaction, owner) {
  const tag = `</${interaction.commandName}:${interaction.commandId}>`;

  const emptyPlaylistError = new EmbedBuilder()
    .setTitle(`**No Playlist**`)
    .setDescription(
      `**${owner}** doesn't have a favorite playlist. Like at least **1** track to create your own playlist.\nTry again with ${tag}.`
    )
    .setColor(colors.default)
    .setThumbnail(musicUtils.thumbnails.emptyfavorite);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [emptyPlaylistError],
    });
  } else {
    await interaction.reply({
      embeds: [emptyPlaylistError],
    });
  }
}

async function handleAccessDeniedError(interaction) {
  const accessDeniedError = new EmbedBuilder()
    .setTitle("**Access denied**")
    .setDescription("You don't have access to perform this action.")
    .setColor(colors.error)
    .setThumbnail(thumbnails.access);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [accessDeniedError],
    });
  } else {
    await interaction.reply({
      embeds: [accessDeniedError],
    });
  }
}

async function handleXpError(interaction, target) {
  const tag = `</${interaction.commandName}:${interaction.commandId}>`;

  const emptyPlaylistError = new EmbedBuilder()
    .setTitle("Not enough XP")
    .setDescription(
      `${target} has not gained enough xp. You should at least send **1** message in the server.\nTry again with ${tag}.`
    )
    .setColor(colors.warning)
    .setThumbnail(thumbnails.warning);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [emptyPlaylistError],
    });
  } else {
    await interaction.reply({
      embeds: [emptyPlaylistError],
    });
  }
}

async function handleAPIError(interaction) {
  warningEmbed
    .setTitle("**API Error**")
    .setDescription(
      "API is not responding at the moment. Please try again later."
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handlePingConnectionError(interaction, host) {
  warningEmbed
    .setTitle("**Connection Timed out!**")
    .setDescription(`Connection to ${host} has been timed out.`);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handlePingUnknownError(interaction) {
  warningEmbed
    .setTitle("**Unknown Host**")
    .setDescription("Unable to retrieve host's ip.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleFileFormatError(interaction) {
  warningEmbed
    .setTitle("**Format Not Supported**")
    .setDescription(
      `This file format is not supported. These are the supported formats:\n- ${formatsLabel}`
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleLargeFileError(interaction) {
  warningEmbed
    .setTitle("**File is too large**")
    .setDescription("File cannot be larger than 10240.0 kb.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleRateLimitError(interaction) {
  warningEmbed
    .setTitle("**Rate Limit Reached**")
    .setDescription(
      "Rate limit for this action has been reached. Please try again later."
    );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleUnavailableError(interaction) {
  const unavailableEmbed = new EmbedBuilder()
    .setTitle("**Not Available**")
    .setDescription(
      "This command is currenty unavailable and under development. Stay tuned for upcoming updates!"
    )
    .setColor(colors.warning)
    .setThumbnail(thumbnails.tools);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [unavailableEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [unavailableEmbed],
      ephemeral: true,
    });
  }
}

async function handleNoBookmarkProfileError(interaction) {
  warningEmbed
    .setTitle("**Profile not found**")
    .setDescription("Make sure they have bookmarked their profile first.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleLiveTrackError(interaction) {
  warningEmbed.setDescription("Unable to perform this action on a live track.");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

async function handleDisabledError(interaction) {
  warningEmbed.setDescription(
    "This action has been disabled in this server. Please contact an admin of the server."
  );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [warningEmbed],
    });
  } else {
    await interaction.reply({
      embeds: [warningEmbed],
    });
  }
}

module.exports = {
  handleDatabaseError,
  handleStreamModeError,
  handleBulkError,
  handleDeleteError,
  handlePermissionError,
  handlePermissionErrorMessage,
  handleWarnError,
  handleVoiceChannelError,
  handleVoiceChannelErrorMessage,
  handleQueueError,
  handleNoResultError,
  handleNoResultErrorMessage,
  handleBusyError,
  handleBusyErrorMessage,
  handleRestriceError,
  handleRestriceErrorMessage,
  handleThirdPartyError,
  handleThirdPartyErrorMessage,
  handleUnknownError,
  handleUnknownErrorMessage,
  handleEmptyPlaylistError,
  handleAccessDeniedError,
  handleXpError,
  handleAPIError,
  handlePingConnectionError,
  handlePingUnknownError,
  handleFileFormatError,
  handleLargeFileError,
  handleRateLimitError,
  handleUnavailableError,
  handleNoBookmarkProfileError,
  handleLiveTrackError,
  handleDisabledError,
};
