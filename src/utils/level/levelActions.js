const levelModel = require("../../database/levelModel");
const { XPreqs, maxLevel } = require("./cardUtils");

let client;
function getLevelClient(importedClient) {
  client = importedClient;
}

async function appendXp(user, XP) {
  let leveledUp = false;

  let userXP = user.xp;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  userXP += XP;
  totalXP += XP;

  while (userXP >= XPreqs[userLevel]) {
    leveledUp = true;

    userXP -= XPreqs[userLevel];
    userLevel++;
  }

  await levelModel.findOneAndUpdate(
    {
      guildId: user.guildId,
      userId: user.userId,
    },
    {
      level: userLevel,
      xp: userXP,
      totalxp: totalXP,
    },
    {
      upsert: true,
    }
  );

  if (leveledUp) {
    setTimeout(async () => {
      await client.emit("levelUp", user);
    }, 1000);
  }
}

async function subtractXp(user, XP) {
  let leveledDown = false;

  let userXP = user.xp;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  userXP -= XP;
  totalXP -= XP;

  while (userXP < 0 && userLevel > 0) {
    leveledDown = true;
    --userLevel;
    userXP += XPreqs[userLevel];
  }

  if (totalXP < 0) {
    userLevel = 0;
    userXP = 0;
    totalXP = 0;
  }

  if (userLevel == 0 && userXP < 0) userXP = 0;

  await levelModel.findOneAndUpdate(
    {
      guildId: user.guildId,
      userId: user.userId,
    },
    {
      level: userLevel,
      xp: userXP,
      totalxp: totalXP,
    },
    {
      upsert: true,
    }
  );

  if (leveledDown) {
    setTimeout(async () => {
      await client.emit("levelDown", user);
    }, 1000);
  }
}

async function appendLevel(user, levels) {
  let leveledUp = false;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  for (let i = 0; i < levels; i++) {
    if (userLevel < maxLevel) {
      totalXP += XPreqs[userLevel];
      userLevel++;

      leveledUp = true;
    }
  }

  await levelModel.findOneAndUpdate(
    {
      guildId: user.guildId,
      userId: user.userId,
    },
    {
      level: userLevel,
      xp: user.xp,
      totalxp: totalXP,
    },
    {
      upsert: true,
    }
  );

  if (leveledUp) {
    setTimeout(async () => {
      await client.emit("levelUp", user);
    }, 1000);
  }
}

async function subtractLevel(user, levels) {
  let leveledDown = false;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  for (let i = 0; i < levels; i++) {
    if (userLevel > 0) {
      userLevel--;
      totalXP -= XPreqs[userLevel];

      leveledDown = true;
    }
  }

  await levelModel.findOneAndUpdate(
    {
      guildId: user.guildId,
      userId: user.userId,
    },
    {
      level: userLevel,
      xp: user.xp,
      totalxp: totalXP,
    },
    {
      upsert: true,
    }
  );

  if (leveledDown) {
    setTimeout(async () => {
      await client.emit("levelDown", user);
    }, 1000);
  }
}

module.exports = {
  getLevelClient,
  appendXp,
  subtractXp,
  appendLevel,
  subtractLevel,
};
