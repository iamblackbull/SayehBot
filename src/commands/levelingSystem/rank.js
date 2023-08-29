const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Levels = require("discord-xp");
const Canvas = require("canvas");
const path = require("path");
require("dotenv").config();
const { subRole1, subRole2, subRole3, rankChannelID } = process.env;
const { mongoose } = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Returns user rank")
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(false);
    })
    .setDMPermission(false),

  async execute(interaction, client) {
    const target = interaction.options.getUser("user") || interaction.user;
    let memberTarget = interaction.guild.members.cache.get(target.id);
    const user = await Levels.fetch(target.id, interaction.guild.id, true);
    const qualified = user.xp > 0;

    let failedEmbed = new EmbedBuilder().setColor(0xffea00);
    let success = false;

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(
          `Connection to database has been timed out.\nTry again later with </rank:1051248003723304963>.`
        )
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );

      interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!qualified) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `${target} has not gained enough xp. User should at least send **1** message in the server.`
        )
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const neededXp = Levels.xpFor(parseInt(user.level + 1));
      const passedXp = Levels.xpFor(parseInt(user.level));
      const finalXp = neededXp - passedXp;
      
      const canvas = new Canvas.createCanvas(1000, 300);
      const ctx = canvas.getContext("2d");
      const barWidth = 600;
      const background = await Canvas.loadImage(
        path.join(__dirname, "../../Images/image8.png")
      );
      const pfp = await Canvas.loadImage(
        target.displayAvatarURL({
          extension: "png",
          size: 1024,
        })
      );

      let x = 0;
      let y = 0;
      ctx.drawImage(background, x, y, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(130, 140, 110, 0, 2 * Math.PI);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#56237d";
      ctx.stroke();
      ctx.closePath();

      ctx.lineJoin = "round";
      ctx.lineWidth = 50;

      ctx.strokeRect(298, 199, barWidth, 0);

      ctx.strokeStyle = "black";
      ctx.strokeRect(300, 200, barWidth, 0);

      ctx.strokeStyle = "#56237d";
      if (user.level < 60) {
        ctx.strokeRect(
          300,
          200,
          (barWidth * (user.xp - passedXp)) / finalXp,
          0
        );
      } else {
        ctx.strokeRect(300, 200, barWidth, 0);
      }

      ctx.fillStyle = "#56237d";
      if (target.id === "481094367407374348") {
        ctx.font = "90px Space Silhouette Font";
        ctx.fillText("SAYEH", 280, 150);
      } else {
        if (target.username.length <= 10) {
          ctx.font = "70px BubbleGum";
        } else if (
          target.username.length > 10 &&
          target.username.length <= 15
        ) {
          ctx.font = "50px BubbleGum";
        } else {
          ctx.font = "35px BubbleGum";
        }
        ctx.fillText(target.username, 280, 150);
      }

      ctx.font = "35px BubbleGum";
      ctx.fillStyle = "#56237d";
      ctx.fillText(`#${user.position || 0}`, 730, 40, 80);
      ctx.fillText(user.level || 0, 900, 40, 80);

      ctx.font = "35px BubbleGum";
      ctx.fillStyle = "#1e3e6b";
      ctx.fillText("Rank", 630, 40, 200);
      ctx.fillText("Level", 800, 40, 200);

      if (memberTarget.roles.cache.has(subRole1)) {
        ctx.font = "25px BubbleGum";
        ctx.fillStyle = "#1e3e6b";
        ctx.fillText("BOOST", 780, 260, 200);

        ctx.fillStyle = "#56237d";
        ctx.fillText("20%", 860, 260, 200);
      }
      if (memberTarget.roles.cache.has(subRole2)) {
        ctx.font = "25px BubbleGum";
        ctx.fillStyle = "#1e3e6b";
        ctx.fillText("BOOST", 780, 260, 200);

        ctx.fillStyle = "#56237d";
        ctx.fillText("50%", 860, 260, 200);
      }
      if (memberTarget.roles.cache.has(subRole3)) {
        ctx.font = "25px BubbleGum";
        ctx.fillStyle = "#1e3e6b";
        ctx.fillText("BOOST", 780, 260, 200);

        ctx.fillStyle = "#56237d";
        ctx.fillText("100%", 860, 260, 200);
      }

      let xpLine;
      if (user.level < 60) {
        xpLine = `${user.xp - passedXp}/${finalXp} XP`;
      } else {
        xpLine = "MAX";
      }

      if (xpLine.length <= 10) {
        if (xpLine.length <= 3) {
          ctx.font = "30px BubbleGum";
          ctx.fillStyle = "#1e3e6b";
          ctx.fillText(xpLine, 850, 150);
        } else {
          ctx.font = "25px BubbleGum";
          ctx.fillStyle = "#1e3e6b";
          ctx.fillText(xpLine, 780, 150);
        }
      } else if (xpLine.length > 10) {
        ctx.font = "18px BubbleGum";
        ctx.fillStyle = "#1e3e6b";
        ctx.fillText(xpLine, 780, 150);
      } else if (xpLine.length > 13) {
        ctx.font = "13px BubbleGum";
        ctx.fillStyle = "#1e3e6b";
        ctx.fillText(xpLine, 780, 150);
      }

      ctx.beginPath();
      ctx.arc(130, 140, 110, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(pfp, 20, 30, 220, 220);

      const attachment = new AttachmentBuilder(canvas.toBuffer());

      interaction.editReply({
        files: [attachment],
      });

      success = true;
    }

    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
    ? `Failed to delete ${interaction.commandName} interaction.`
    : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === rankChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
