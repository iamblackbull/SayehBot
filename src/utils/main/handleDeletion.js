const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;
const { consoleTags } = require("./mainUtils");

function parseTime(time) {
  const parts = time.split(":").map(Number);
  let seconds = 0;

  if (parts.length === 3) {
    seconds += parts[0] * 3_600_000;
    seconds += parts[1] * 60_000;
    seconds += parts[2];
  } else if (parts.length === 2) {
    seconds += parts[0] * 60_000;
    seconds += parts[1];
  }

  return seconds;
}

function calculateTimer(interaction, id, success) {
  let timer = 120_000;

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

          const totalDuration = parseTime(total.label);
          const currentDuration = parseTime(current.label);

          timer = totalDuration - currentDuration;

          if (timer == 0 || timer > 600_000) timer = 600_000;
          else if (timer < 60_000) timer = 60_000;
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
  const { commandName, customId, guildId, channel } = interaction;
  let timer;

  if (
    (success && commandName?.includes("autoplay")) ||
    commandName?.includes("leave") ||
    commandName?.includes("search") ||
    commandName?.includes("shuffle") ||
    customId?.includes("lyrics") ||
    commandName?.includes("lyrics") ||
    success === "favorite"
  ) {
    timer = 600_000;
  } else {
    timer = calculateTimer(interaction, guildId, success);
  }

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull ${commandName} interaction.`;

  setTimeout(async () => {
    if (success && channel.id === musicChannelID) {
      await interaction.editReply({ components: [] });
    } else {
      interaction?.deleteReply().catch((e) => {
        console.log(timeoutLog);
      });
    }
  }, timer);
}

async function handleMessageDelection(
  client,
  firstMsg,
  msg,
  success = Boolean
) {
  const { guild, channel, author } = msg;
  const timer = calculateTimer(false, guild.id, success);

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull play message.`;

  setTimeout(async () => {
    if (success && channel.id === musicChannelID) {
      await msg.edit({ components: [] });
    } else if (author.id === client.user.id) {
      try {
        await msg.delete();
        await firstMsg?.delete();
      } catch (e) {
        console.log(timeoutLog);
      }
    }
  }, timer);
}

function handleEventDelection(msg, success = Boolean) {
  const timer = calculateTimer(false, msg.guild.id, success);

  setTimeout(async () => {
    await msg.delete().catch((e) => {
      console.log(
        `${consoleTags.warning} Failed to delete player event message.`
      );
    });
  }, timer);
}

function handleFollowUpDeletion(interaction, msg, success = Boolean) {
  const { guildId, commandName, channel } = interaction;
  const timer = calculateTimer(interaction, guildId, success);

  const un = success ? "" : "un";
  const timeoutLog = `${consoleTags.warning} Failed to delete ${un}successfull ${commandName} follow-up.`;

  setTimeout(async () => {
    if (success && channel.id === musicChannelID) {
      await msg.edit({ components: [] });
    } else {
      await msg.delete().catch((e) => {
        console.log(timeoutLog);
      });
    }
  }, timer);
}

function handleNonMusicalDeletion(
  interaction,
  success = Boolean,
  minutes = Number
) {
  const timer = success ? minutes : 2;

  setTimeout(async () => {
    if (!success) await interaction.deleteReply().catch(e);
    else await interaction.editReply({ components: [] }).catch(e);
  }, timer * 60_000);
}

module.exports = {
  parseTime,
  handleInteractionDeletion,
  handleMessageDelection,
  handleEventDelection,
  handleFollowUpDeletion,
  handleNonMusicalDeletion,
};
