const { clearIntervals } = require("../../utils/client/intervals");

process.on("SIGINT", () => {
  clearIntervals();

  console.log("[Application Logs]: SayehBot is now offline.");

  process.exit();
});
