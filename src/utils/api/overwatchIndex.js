function findStatIndex(statsArray, statName) {
  for (let i = 0; i < statsArray.length; i++) {
    if (statsArray[i].title === statName) {
      return i;
    }
  }
  return -1;
}

module.exports = {
  findStatIndex,
};
