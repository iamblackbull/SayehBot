const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
const { consoleTags } = require("./mainUtils");

function calculateTimer(interaction, id, success) {
  let timer = 2 * 60;

  if (success) {
    if (
      interaction?.commandName !== "skip" &&
      interaction?.customId !== "skip-button"
    ) {
      const timeline = useTimeline(id);

      if (
        timeline !== null &&
        timeline.timestamp !== null &&
        timeline.timestamp.total !== null &&
        timeline.timestamp.current !== null
      ) {
        try {
          const { total, current } = timeline.timestamp;

          const duration = total.label;
          const convertor = duration.split(":");
          const totalTimer = +convertor[0] * 60 + +convertor[1];

          const currentDuration = current.label;
          const currentConvertor = currentDuration.split(":");
          const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

          timer = totalTimer - currentTimer;

          if (totalTimer == 0 || timer > 10 * 60) timer = 10 * 60;
          else if (timer < 1 * 60) timer = 1 * 60;
        } catch (error) {
          console.log(
            `${consoleTags.error} While calculating track timer: `,
            error
          );
        }
      }
    }
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
    timer = calculateTimer(interaction, interaction.guildId, success);
  }

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull ${interaction.commandName} interaction.`;
  const reactionLog = `${consoleTags.warning} Failed to remove reactions from ${un}successfull ${interaction.commandName} interaction.`;

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
  const timer = calculateTimer(false, msg.guild.id, success);

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull play message.`;

  setTimeout(async () => {
    if (success && msg?.channel?.id === musicChannelID) {
      await msg.edit({ components: [] });
    } else if (msg?.author?.id === client.user.id) {
      try {
        await msg.delete();
        await firstMsg?.delete();
      } catch (e) {
        console.log(timeoutLog);
      }
    }
  }, timer * 1000);
}

function handleEventDelection(msg) {
  const timer = calculateTimer(false, msg.guild.id, true);

  setTimeout(async () => {
    await msg?.delete().catch((e) => {
      console.log(
        `${consoleTags.warning} Failed to delete playStart event message.`
      );
    });
  }, timer * 1000);
}

function handleFollowUpDeletion(interaction, msg, success) {
  const timer = calculateTimer(interaction, interaction.guildId, success);

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull ${interaction.commandName} follow-up.`;

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

function handleNonMusicalDeletion(interaction, success, channelId, minutes) {
  const timer = success ? minutes : 2;

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull ${interaction.commandName} interaction.`;

  setTimeout(async () => {
    if (success && interaction.channel.id === channelId) return;
    else {
      await interaction.deleteReply().catch((e) => {
        console.log(timeoutLog);
      });
    }
  }, timer * 60 * 1000);
}

module.exports = {
  handleInteractionDeletion,
  handleMessageDelection,
  handleEventDelection,
  handleFollowUpDeletion,
  handleNonMusicalDeletion,
};
