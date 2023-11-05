const { EmbedBuilder } = require("discord.js");

async function handleDatabaseError(interaction) {
  const databaseError = new EmbedBuilder()
    .setTitle(`**Connection Timed out!**`)
    .setDescription(`Connection to database has been timed out.`)
    .setColor(0xffea00)
    .setThumbnail(
      `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
    );

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

let actionFailedError = new EmbedBuilder()
  .setTitle(`**Action Failed**`)
  .setColor(0xffea00)
  .setThumbnail(
    `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
  );

async function handlePermissionError(interaction) {
  actionFailedError.setDescription(`Bot doesn't have the required permission!`);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [actionFailedError],
    });
  } else {
    await interaction.reply({
      embeds: [actionFailedError],
    });
  }
}

async function handlePermissionErrorMessage(message) {
  actionFailedError.setDescription(`Bot doesn't have the required permission!`);

  const msg = await message.reply({
    embeds: [actionFailedError],
  });

  return msg;
}

async function handleVoiceChannelError(interaction) {
  actionFailedError.setDescription(
    `You need to be in a voice channel to use this command.`
  );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [actionFailedError],
    });
  } else {
    await interaction.reply({
      embeds: [actionFailedError],
    });
  }
}

async function handleVoiceChannelErrorMessage(message) {
  actionFailedError.setDescription(
    `You need to be in a voice channel to use this command.`
  );

  const msg = await message.reply({
    embeds: [actionFailedError],
  });

  return msg;
}

async function handleQueueError(interaction) {
  actionFailedError.setDescription(
    `There is no queue, queue is empty or queue history is not available.`
  );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      embeds: [actionFailedError],
    });
  } else {
    await interaction.reply({
      embeds: [actionFailedError],
    });
  }
}

const noResultError = new EmbedBuilder()
  .setTitle(`**No Result**`)
  .setDescription(`Make sure you input a valid query.`)
  .setColor(0xffea00)
  .setThumbnail(`https://cdn-icons-png.flaticon.com/512/6134/6134065.png`);

async function handleNoResultError(interaction) {
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
  .setTitle(`**Busy**`)
  .setDescription(`Bot is busy in another voice channel.`)
  .setColor(0x256fc4)
  .setThumbnail(`https://cdn-icons-png.flaticon.com/512/1830/1830857.png`);

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
  .setTitle(`**Age / Sensitive restriction**`)
  .setDescription(
    `Track found but unable to play it due to age limitation or sensitive content restriction.`
  )
  .setColor(0xffea00)
  .setThumbnail(`https://cdn-icons-png.flaticon.com/512/6711/6711603.png`);

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
  .setTitle(`**Third-Party Error**`)
  .setDescription(
    `Track found but unable to retrieve audio data due to third-party package failure.`
  )
  .setColor(0xffea00)
  .setThumbnail(`https://cdn-icons-png.flaticon.com/512/7508/7508992.png`);

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
  .setTitle(`**Unknown Error**`)
  .setDescription(
    `An Unknown error occurred.`
  )
  .setColor(0xe01010)
  .setThumbnail(
    `https://cdn.pixabay.com/photo/2015/06/09/16/12/error-803716_1280.png`
  );

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
  const emptyPlaylistError = new EmbedBuilder()
    .setTitle(`**No Playlist**`)
    .setDescription(
      `**${owner}** doesn't have a favorite playlist. Like at least **1** track to create your own playlist.\nTry again with </favorite:1108681222764367962>.`
    )
    .setColor(0xffea00)
    .setThumbnail(`https://cdn-icons-png.flaticon.com/128/5994/5994754.png`);

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
    .setTitle(`**Access denied**`)
    .setDescription(`You don't have access to perform this action.`)
    .setColor(0xe01010)
    .setThumbnail(`https://cdn-icons-png.flaticon.com/512/2913/2913133.png`);

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

module.exports = {
  handleDatabaseError,
  handlePermissionError,
  handlePermissionErrorMessage,
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
};
