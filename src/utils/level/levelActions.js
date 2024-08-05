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

  while (userXP >= XPreqs[userLevel - 1]) {
    leveledUp = true;

    userXP -= XPreqs[userLevel - 1];
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
    userXP += XPreqs[userLevel - 1];
  }

  if (totalXP < 0) {
    userLevel = 0;
    userXP = 0;
    totalXP = 0;
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

  if (leveledDown) {
    setTimeout(async () => {
      await client.emit("levelDown", user);
    }, 1000);
  }
}

async function appendLevel(user, levels) {
  let leveledUp = false;

  let userXP = user.xp;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  for (let i = 0; i < levels; i++) {
    if (userLevel < maxLevel) {
      userXP += XPreqs[userLevel - 1];
      totalXP += XPreqs[userLevel - 1];

      userLevel++;

      leveledUp = true;
    } else break;
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

async function subtractLevel(user, levels) {
  let leveledDown = false;

  let userXP = user.xp;
  let totalXP = user.totalxp;
  let userLevel = user.level;

  for (let i = 0; i < levels; i++) {
    if (userLevel > 0) {
      userLevel--;

      userXP -= XPreqs[userLevel - 1];
      totalXP -= XPreqs[userLevel - 1];

      leveledDown = true;
    } else {
      userXP = 0;
      break;
    }
  }

  if (userXP < 0) userXP = 0;

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

module.exports = {
  getLevelClient,
  appendXp,
  subtractXp,
  appendLevel,
  subtractLevel,
};
