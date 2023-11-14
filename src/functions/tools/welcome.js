require("dotenv").config();
const { welcomeRoleID, leaveChannelID, guildID } = process.env;
const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const path = require("path");
const { getChannelId } = require("../../commands/server/setwelcome");

const welcomeMessageSent = new Set();
const leaveMessageSent = new Set();

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
    const role = member.guild.roles.cache.find((role) => role.id === roleID);
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
    ctx.lineWidth = 10;
    if (guild.memberCount === "2000") {
      ctx.strokeStyle = "#b59410";
    } else {
      ctx.strokeStyle = "#56237d";
    }
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "#56237d";
    if (guild.memberCount === "2000") {
      ctx.font = "72px Space Silhouette Font";
    } else {
      ctx.font = "72px BubbleGum";
    }
    ctx.textAlign = "center";
    let text = `WELCOME`;
    ctx.fillText(text, 512, 360);

    ctx.fillStyle = "#1e3e6b";
    if (guild.memberCount === "2000") {
      ctx.font = "40px Space Silhouette Font";
    } else {
      ctx.font = "40px BubbleGum";
    }
    ctx.textAlign = "center";
    text = `${member.user.username}`;
    ctx.fillText(text.toUpperCase(), 512, 410);

    if (guild.memberCount === "2000") {
      ctx.fillStyle = "#b59410";
      ctx.font = "30px Space Silhouette Font";
    } else {
      ctx.fillStyle = "#56237d";
      ctx.font = "30px BubbleGum";
    }
    ctx.textAlign = "center";
    text = `Member #${guild.memberCount}`;
    ctx.fillText(text, 512, 455);

    ctx.beginPath();
    ctx.arc(512, 166, 119, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(pfp, 393, 47, 238, 238);

    const attachment = new AttachmentBuilder(canvas.toBuffer());

    let content;
    if (guild.memberCount === "2000") {
      content = `Zalaaam ${member.user}, Welcome to **${guild.name}**'s server! Our **${guild.memberCount}** member!`;
    } else {
      content = `Zalaaam ${member.user}, Welcome to **${guild.name}**'s server!`;
    }

    console.log(
      `${member.user.username} (Member #${guild.memberCount}) just joined the server.`
    );

    if (welcomeMessageSent.has(member.id)) return;
    welcomeMessageSent.add(member.id);

    let msg = await channel.send({
      content: content,
    });

    setTimeout(() => {
      welcomeMessageSent.delete(member.id);
    }, 10 * 60 * 1000);

    setTimeout(async () => {
      await msg.edit({
        files: [attachment],
      });
    }, 1 * 1000);
  });

  client.on("guildMemberRemove", async (member) => {
    const { guild } = member;
    const channel = guild.channels.cache.get(leaveChannelID);

    console.log(`${member.user.username} left the server.`);

    if (leaveMessageSent.has(member.id)) return;
    leaveMessageSent.add(member.id);

    setTimeout(async () => {
      await channel.send({
        content: `**${member.user.username}** left the server.`,
      });
    }, 2 * 1000);

    setTimeout(() => {
      leaveMessageSent.delete(member.id);
    }, 10 * 60 * 1000);
  });
};
