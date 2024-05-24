const { DBTOKEN, rankChannelID } = process.env;
const eventsModel = require("../../database/eventsModel");
const Levels = require("discord-xp");
Levels.setURL(DBTOKEN);

async function checkLevelUp(hasLevelUp, target, guild) {
  if (hasLevelUp) {
    const user = await Levels.fetch(target.id, guild);

    console.log(`${target.username} just advanced to Level ${user.level}.`);

    const channel = message.guild.channels.cache.get(rankChannelID);

    setTimeout(async () => {
      await channel.send(
        `🎊 ${target} just advanced to Level **${user.level}** 🙌`
      );
    }, 1 * 1000);
  }
}

async function checkLevelDown(hasLevelDown, target, guild) {
  if (hasLevelDown) {
    const user = await Levels.fetch(target.id, guild);

    console.log(`${target.username} just retreated to Level ${user.level}.`);

    const channel = message.guild.channels.cache.get(rankChannelID);

    setTimeout(async () => {
      await channel.send(
        `😓 ${target} just retreated to Level **${user.level}** 📉`
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

  await checkLevelUp(hasLevelUp, message.author, message.guild.id);

  console.log(`${message.author.username} gained ${xp} XP.`);
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

  await checkLevelUp(hasLevelUp, interaction.user, interaction.guild.id);

  console.log(`${interaction.user.username} gained ${xp} XP.`);
}

async function handleVoiceXp(state, xp) {
  const eventsList = await eventsModel.findOne({
    guildId: state.guild.id,
    Level: true,
  });
  if (!eventsList) return;

  const hasLevelUp = await Levels.appendXp(state.member.id, state.guild.id, xp);

  await checkLevelUp(hasLevelUp, state.member.user, state.guild.id);

  console.log(`${state.member.user.username} gained ${xp} XP.`);
}

async function handleInteractionCommand(interaction, amount, action, unit) {
  const user = interaction.options.getUser("user");

  if (action === "granted") {
    let hasLevelUp = false;

    action = "granted to";

    if (unit === "level") {
      hasLevelUp = await Levels.appendLevel(
        user.id,
        interaction.guild.id,
        amount
      );
    } else {
      unit = "XP";

      hasLevelUp = await Levels.appendXp(user.id, interaction.guild.id, amount);
    }

    await checkLevelUp(hasLevelUp, user, interaction.guild.id);
  } else {
    let hasLevelDown = false;

    action = "removed from";

    if (unit === "level") {
      hasLevelDown = await Levels.subtractLevel(
        user.id,
        interaction.guild.id,
        amount
      );
    } else {
      unit = "XP";

      hasLevelDown = await Levels.subtractXp(
        user.id,
        interaction.guild.id,
        amount
      );
    }

    await checkLevelDown(hasLevelDown, user, interaction.guild.id);
  }

  console.log(
    `${amount} ${unit} ${action} ${user} by ${interaction.user.username}.`
  );

  return { action, unit };
}

async function handleRollXp(interaction, user, XP, type) {
  let mode;

  if (type === 1) {
    mode = "won";

    const hasLevelUp = await Levels.appendXp(
      interaction.user.id,
      interaction.guild.id,
      XP
    );

    await checkLevelUp(hasLevelUp, interaction.user, interaction.guild.id);
  } else if (type === 0) {
    mode = "lost";

    const finalXp = XP > user.xp ? user.xp - 1 : XP;

    const hasLevelDown = await Levels.subtractXp(
      interaction.user.id,
      interaction.guild.id,
      finalXp
    );

    await checkLevelDown(hasLevelDown, interaction.user, interaction.guild.id);
  }

  console.log(
    `${interaction.user.username} ${mode} ${XP} XP by rolling ${roll}.`
  );
}

module.exports = {
  handleMessageXp,
  handleInteractionXp,
  handleVoiceXp,
  handleInteractionCommand,
  handleRollXp,
};
