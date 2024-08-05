const { getSystemUsage } = require("../../utils/client/handleSystemUsage");
const { consoleTags } = require("../../utils/main/mainUtils");

let lastLogTime = 0;
const cooldown = 30_000;

module.exports = (client) => {
  client.checkSystem = async () => {
    const { cpuPercent, memPercent } = await getSystemUsage();

    if (memPercent < 80) return;

    const now = Date.now();

    if (now - lastLogTime <= cooldown) return;
    lastLogTime = now;

    const developer = await client.users.fetch(process.env.developerID);
    if (!developer) return;

    const content = `${consoleTags.warning} CPU: **${cpuPercent} %** | RAM: **${memPercent} %**`;

    await developer.send(content);

    console.log(`${consoleTags.warning} ${content}`);
  };
};
