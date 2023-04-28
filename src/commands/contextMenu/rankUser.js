const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Levels = require("discord-xp");
const Canvas = require("canvas");
const path = require("path");
require("dotenv").config();
const { subRole1, subRole2, subRole3, rankChannelID } = process.env;

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get rank")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    const target = interaction.options.getUser("user") || interaction.user;
    let memberTarget = interaction.guild.members.cache.get(target.id);
    const user = await Levels.fetch(target.id, interaction.guild.id, true);

    if (user.xp > 0) {
      const neededXp = Levels.xpFor(parseInt(user.level + 1));
      const passedXp = Levels.xpFor(parseInt(user.level));
      const finalXp = neededXp - passedXp;
      const canvas = new Canvas.createCanvas(1000, 300);
      const ctx = canvas.getContext("2d");
      bar_width = 600;
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

      ctx.strokeRect(298, 199, bar_width, 0);

      ctx.strokeStyle = "black";
      ctx.strokeRect(300, 200, bar_width, 0);

      ctx.strokeStyle = "#56237d";
      if (user.level < 60) {
        ctx.strokeRect(
          300,
          200,
          (bar_width * (user.xp - passedXp)) / finalXp,
          0
        );
      } else {
        ctx.strokeRect(300, 200, bar_width, 0);
      }

      if (target.username.length <= 10) {
        ctx.font = "70px BubbleGum";
        ctx.fillStyle = "#56237d";
        ctx.fillText(target.username, 280, 150);
      }
      if (target.username.length > 10) {
        if (target.username.length > 15) {
          ctx.font = "35px BubbleGum";
          ctx.fillStyle = "#56237d";
          ctx.fillText(target.username, 280, 150);
        } else {
          ctx.font = "50px BubbleGum";
          ctx.fillStyle = "#56237d";
          ctx.fillText(target.username, 280, 150);
        }
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
        xpLine = `MAX`;
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
    } else {
      let failedEmbed = new EmbedBuilder()
        .setTitle(`**Action Failed**`)
        .setDescription(`${target} has not gained enough xp.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === rankChannelID) return;
        else {
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Rank context menu.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Rank context menu.`);
        });
      }
    }, 5 * 60 * 1000);
  },
};
