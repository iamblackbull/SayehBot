const { DBTOKEN, rankChannelID } = process.env;
const eventsModel = require("../../database/eventsModel");
const { consoleTags } = require("../../utils/main/mainUtils");
const Levels = require("discord-xp");

Levels.setURL(DBTOKEN);

async function checkLevelUp(hasLevelUp, target, guild) {
  if (hasLevelUp) {
    const user = await Levels.fetch(target.id, guild.id);

    console.log(
      `${consoleTags.app} ${target.username} just advanced to Level ${user.level}.`
    );

    const channel = await guild.channels.fetch(rankChannelID);

    setTimeout(async () => {
      await channel.send(
        `🎊 ${target} just advanced to Level **${user.level}** 🙌`
      );
    }, 1 * 1000);
  }
}

async function handleMessageXp(message, xp) {
  const eventsList = await eventsModel.findOne({
    guildId: message.guild.id,
    Level: true,
  });
  if (!eventsList) return;

  const hasLevelUp = await Levels.appendXp(
    message.author.id,
    message.guild.id,
    xp
  );

  await checkLevelUp(hasLevelUp, message.author, message.guild);

  console.log(`${consoleTags.app} ${message.author.username} gained ${xp} XP.`);
}

async function handleInteractionXp(interaction, xp) {
  const eventsList = await eventsModel.findOne({
    guildId: interaction.guild.id,
    Level: true,
  });
  if (!eventsList) return;

  const hasLevelUp = await Levels.appendXp(
    interaction.user.id,
    interaction.guild.id,
    xp
  );

  await checkLevelUp(hasLevelUp, interaction.user, interaction.guild);

  console.log(
    `${consoleTags.app} ${interaction.user.username} gained ${xp} XP.`
  );
}

async function handleVoiceXp(state, xp) {
  const eventsList = await eventsModel.findOne({
    guildId: state.guild.id,
    Level: true,
  });
  if (!eventsList) return;

  const hasLevelUp = await Levels.appendXp(state.member.id, state.guild.id, xp);

  await checkLevelUp(hasLevelUp, state.member.user, state.guild);

  console.log(
    `${consoleTags.app} ${state.member.user.username} gained ${xp} XP.`
  );
}

async function handleInteractionCommand(interaction, amount, action, unit) {
  const user = interaction.options.getUser("user");

  let Action;
  let Unit;

  if (action === "granted") {
    let hasLevelUp = false;

    Action = "granted to";

    if (unit === "level") {
      Unit = "level";

      hasLevelUp = await Levels.appendLevel(
        user.id,
        interaction.guild.id,
        amount
      );
    } else {
      Unit = "XP";

      hasLevelUp = await Levels.appendXp(user.id, interaction.guild.id, amount);
    }

    await checkLevelUp(hasLevelUp, user, interaction.guild);
  } else {
    Action = "removed from";

    if (unit === "level") {
      Unit = "level";

      await Levels.subtractLevel(user.id, interaction.guild.id, amount);
    } else {
      Unit = "XP";

      await Levels.subtractXp(user.id, interaction.guild.id, amount);
    }
  }

  console.log(
    `${consoleTags.app} ${amount} ${Unit} ${Action} ${user.username} by ${interaction.user.username}.`
  );

  return { Action, Unit };
}

async function handleRollXp(interaction, user, XP, type, roll) {
  let mode;

  if (type === 1) {
    mode = "won";

    const hasLevelUp = await Levels.appendXp(
      interaction.user.id,
      interaction.guild.id,
      XP
    );

    await checkLevelUp(hasLevelUp, interaction.user, interaction.guild);
  } else if (type === 0) {
    mode = "lost";

    const finalXp = XP > user.xp ? user.xp - 1 : XP;

    await Levels.subtractXp(interaction.user.id, interaction.guild.id, finalXp);
  }

  console.log(
    `${consoleTags.app} ${interaction.user.username} ${mode} ${XP} XP by rolling ${roll}.`
  );
}

module.exports = {
  handleMessageXp,
  handleInteractionXp,
  handleVoiceXp,
  handleInteractionCommand,
  handleRollXp,
};
