const { clearIntervals } = require("../../utils/client/intervals");
const { consoleTags } = require("../../utils/main/mainUtils");

process.on("SIGINT", () => {
  clearIntervals();

  console.log(`${consoleTags.app} SayehBot is now offline.`);

  process.exit();
});
