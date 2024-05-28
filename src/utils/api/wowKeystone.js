function getKeystoneUpgradeSymbol(numUpgrades) {
  switch (numUpgrades) {
    case 1:
      return "+";
    case 2:
      return "++";
    case 3:
      return "+++";
    case -1:
      return "-";
    default:
      return "";
  }
}

module.exports = {
  getKeystoneUpgradeSymbol,
};
