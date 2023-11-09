const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

function calculateTimer(id, success) {
  let timer;

  if (success) {
    const { timestamp } = useTimeline(id);

    if (!timestamp || !timestamp.total || !timestamp.current) timer = 2 * 60;
    else {
      const duration = timestamp.total.label;
      const convertor = duration.split(":");
      const totalTimer = +convertor[0] * 60 + +convertor[1];

      const currentDuration = timestamp.current.label;
      const currentConvertor = currentDuration.split(":");
      const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

      timer = totalTimer - currentTimer;

      if (timer > 10 * 60) timer = 10 * 60;
      if (timer < 1 * 60) timer = 1 * 60;
    }
  } else {
    timer = 2 * 60;
  }

  return timer;
}

function handleInteractionDeletion(interaction, success) {
  let timer;

  if (
    (success && interaction.commandName?.includes("autoplay")) ||
    interaction.commandName?.includes("leave") ||
    interaction.commandName?.includes("search") ||
    interaction.commandName?.includes("shuffle") ||
    interaction.customId?.includes("lyrics") ||
    interaction.commandName?.includes("lyrics") ||
    success === "favorite"
  ) {
    timer = 10 * 60;
  } else {
    timer = calculateTimer(interaction.guildId, success);
  }

  const un = success ? "" : "un";
  const timeoutLog = `Failed to delete ${un}successfull ${interaction.commandName} interaction.`;
  const reactionLog = `Failed to remove reactions from ${un}successfull ${interaction.commandName} interaction.`;

  setTimeout(async () => {
    if (success && interaction?.channel?.id === musicChannelID) {
      if (interaction.reactions?.cache.size > 0) {
        await interaction.reactions.removeAll().catch((e) => {
          console.log(reactionLog);
        });
      }

      await interaction.editReply({ components: [] });
    } else {
      interaction?.deleteReply().catch((e) => {
        console.log(timeoutLog);
      });
    }
  }, timer * 1000);
}

async function handleMessageDelection(client, firstMsg, msg, success) {
  const timer = calculateTimer(msg.guild.id, success);

  const un = success ? "" : "un";
  const timeoutLog = `Failed to delete ${un}successfull play message.`;

  setTimeout(async () => {
    if (success && msg?.channel?.id === musicChannelID) {
      await msg.edit({ components: [] });
    } else if (msg?.author?.id === client.user.id) {
      try {
        await msg.delete();
        await firstMsg?.delete();

        console.log("Deleted a play message.");
      } catch (e) {
        console.log(timeoutLog);
      }
    }
  }, timer * 1000);
}

function handleEventDelection(msg) {
  const timer = calculateTimer(msg.guild.id, true);

  setTimeout(async () => {
    await msg?.delete().catch((e) => {
      console.log("Failed to delete playStart event message.");
    });
  }, timer * 1000);
}

function handleFollowUpDeletion(interaction, msg, success) {
  const timer = calculateTimer(interaction.guildId, success);

  const un = success ? "" : "un";
  const timeoutLog = `Failed to delete ${un}successfull ${interaction.commandName} follow-up.`;

  setTimeout(async () => {
    if (success && interaction.channel?.id === musicChannelID)
      await msg?.edit({ components: [] });
    else {
      await msg?.delete().catch((e) => {
        console.log(timeoutLog);
      });
    }
  }, timer * 1000);
}

module.exports = {
  handleInteractionDeletion,
  handleMessageDelection,
  handleEventDelection,
  handleFollowUpDeletion,
};
