require("dotenv").config();
const { welcomeRoleID, leaveChannelID, guildID } = process.env;
const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const path = require("path");
const { getChannelId } = require("../../commands/server/setwelcome");

module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    const { guild } = member;

    const channelId = getChannelId(guildID);
    if (!channelId) {
      return;
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return;
    }

    const roleID = welcomeRoleID;
    let role = member.guild.roles.cache.find((r) => r.id === roleID);
    member.roles.add(role);

    const canvas = Canvas.createCanvas(1024, 500);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(
      path.join(__dirname, "../../Images/image6.png")
    );

    let x = 0;
    let y = 0;
    ctx.drawImage(background, x, y);

    const pfp = await Canvas.loadImage(
      member.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      })
    );

    x = canvas.width / 2 - pfp.width / 2;
    y = 40;

    ctx.beginPath();
    ctx.arc(512, 166, 119, 0, 2 * Math.PI, true);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#56237d";
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#56237d";
    ctx.font = "72px BubbleGum";
    let text = `WELCOME`;
    ctx.fillText(text, 360, 360);

    ctx.fillStyle = "#1e3e6b";
    ctx.font = "40px BubbleGum";
    ctx.textAlign = "center";
    text = `${member.user.tag}`;
    ctx.fillText(text.toUpperCase(), 512, 410);

    ctx.fillStyle = "#56237d";
    ctx.font = "30px BubbleGum";
    text = `Member #${guild.memberCount}`;
    ctx.fillText(text, 512, 455);

    ctx.beginPath();
    ctx.arc(512, 166, 119, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(pfp, 393, 47, 238, 238);

    const attachment = new AttachmentBuilder(canvas.toBuffer());

    await channel.send({
      content: `Yo ${member.user}, Welcome to **${guild.name}** !`,
      files: [attachment],
    });
    console.log(
      `New member joined: ${member.user.tag} (Member #${guild.memberCount})`
    );
  });
  client.on("guildMemberRemove", async (member) => {
    const { guild } = member;
    const channel = guild.channels.cache.get(leaveChannelID);

    channel.send({
      content: `**${member.user.tag}** left the server.`,
    });
  });
};
