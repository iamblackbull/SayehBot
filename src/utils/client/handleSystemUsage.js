const osu = require("node-os-utils");

export async function getSystemUsage() {
  const cpuUsage = await osu.cpu.usage();
  const memInfo = await osu.mem.info();
  const freeMemory = memInfo.freeMemMb;
  const totalMemory = memInfo.totalMemMb;
  const usedMemory = totalMemory - freeMemory;
  const cpuPercent = cpuUsage.toFixed(2);
  const memPercent = ((usedMemory / totalMemory) * 100).toFixed(2);
  const totalMemoryGB = (totalMemory / 1024).toFixed(2);

  return { cpuPercent, memPercent, totalMemoryGB };
}
