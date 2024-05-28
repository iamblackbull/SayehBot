const { subRole1, subRole2, subRole3, boostRole } = process.env;
let cacheXp = 0;

function getRandomXp() {
  return Math.floor(Math.random() * 50 + 15); /// 30 ta 100
}

async function calculateXP(input, user) {
  let firstXp;

  do {
    firstXp = getRandomXp();
  } while (firstXp === cacheXp);
  cacheXp = firstXp;

  const rawXp = parseInt(firstXp * 2);
  let finalXp = parseInt(rawXp);
  let boost = false;

  const roleMultipliers = new Map([
    [subRole1, 1.25],
    [subRole2, 1.5],
    [subRole3, 2],
  ]);

  if (user.level < 60 || !user.level || user.level !== undefined) {
    for (const [role, multiplier] of roleMultipliers) {
      if (input.member.roles.cache.has(role)) {
        boost = multiplier;
        break;
      }
    }

    if (input.member.roles.cache.has(boostRole)) {
      boost = boost ? boost + 0.5 : 1.5;
    }

    if (boost) finalXp = parseInt(rawXp * boost);
  }

  return { finalXp };
}

module.exports = {
  calculateXP,
};
