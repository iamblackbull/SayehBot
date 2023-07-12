const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Levels = require("discord-xp");
const { rankChannelID, guildID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a random number between 1 - 100")
    .setDMPermission(false),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    const target = interaction.user;
    const user = await Levels.fetch(target.id, interaction.guild.id, true);
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = guild.channels.cache.get(rankChannelID);

    let roll = Math.floor(Math.random() * 100) + 1;

    if (roll > 100) {
      roll = 100;
    }
    if (roll < 1) {
      roll = 1;
    }

    await interaction.editReply({
      content: `🎲 ${interaction.user} rolls **${roll}** `,
    });
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Roll interaction.`);
      });
    }, 2 * 60 * 1000);

    if (user.xp > 0) {
      let gambleRoll = Math.floor(Math.random() * 10) + 1;

      let gambleEmbed = new EmbedBuilder().setFooter({
        iconURL: `https://cdn-icons-png.flaticon.com/512/831/831184.png`,
        text: `Gamble`,
      });

      if (gambleRoll > 10) {
        gambleRoll = 10;
      }
      if (gambleRoll < 1) {
        gambleRoll = 1;
      }
      if (roll === 100) {
        if (user.level === 60) return;
        else {
          const winXp = parseInt(gambleRoll * 100);
          const hasLevelUp = await Levels.appendXp(
            interaction.user.id,
            interaction.guild.id,
            winXp
          );
          gambleEmbed
            .setTitle(`Winner`)
            .setDescription(`${interaction.user} won **${winXp}** XP`)
            .setColor(0x46eb34)
            .setThumbnail(
              `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} won ${winXp} XP by rolling ${roll} `
          );
          if (hasLevelUp) {
            const user = await Levels.fetch(
              interaction.user.id,
              interaction.guild.id
            );
            console.log(
              `${interaction.user.uesrname} just advanced to level ${user.level}`
            );
            channel.send(
              `🎊 ${interaction.user} just advanced to level **${user.level}** 🙌`
            );
          }
        }
      } else if (roll === 1) {
        if (user.level === 60) return;
        else {
          let loseXp = parseInt(gambleRoll * 100);
          if (loseXp > user.xp) {
            loseXp = uesr.xp;
          }
          await Levels.subtractXp(
            interaction.user.id,
            interaction.guild.id,
            loseXp
          );
          gambleEmbed
            .setTitle(`Loser`)
            .setDescription(`${interaction.user} lost **${loseXp}** XP`)
            .setColor(0xe01010)
            .setThumbnail(
              `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} lost ${loseXp} XP by rolling ${roll} `
          );
        }
      } else if (roll === 50) {
        if (user.level === 60) return;
        else {
          let Xp = parseInt(gambleRoll * 50);
          if (gambleRoll >= 5) {
            const hasLevelUp = await Levels.appendXp(
              interaction.user.id,
              interaction.guild.id,
              Xp
            );
            gambleEmbed
              .setTitle(`Winner`)
              .setDescription(`${interaction.user} won **${Xp}** XP`)
              .setColor(0x46eb34)
              .setThumbnail(
                `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
              );
            console.log(
              `${interaction.user.username} won ${Xp} XP by rolling ${roll} `
            );
            if (hasLevelUp) {
              const user = await Levels.fetch(
                interaction.user.id,
                interaction.guild.id
              );
              console.log(
                `${interaction.user.username} just advanced to level ${user.level}`
              );
              channel.send(
                `🎊 ${interaction.user} just advanced to level **${user.level}** 🙌`
              );
            }
          } else if (gambleRoll < 5) {
            if (Xp > user.xp) {
              Xp = user.xp;
            }
            await Levels.subtractXp(
              interaction.user.id,
              interaction.guild.id,
              Xp
            );
            gambleEmbed
              .setTitle(`Loser`)
              .setDescription(`${interaction.user} lost **${Xp}** XP`)
              .setColor(0xe01010)
              .setThumbnail(
                `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
              );
            console.log(
              `${interaction.user.username} lost ${Xp} XP by rolling ${roll} `
            );
          }
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
        }
      } else if (roll === 85) {
        if (user.level === 60) return;
        else {
          const winXp = parseInt(gambleRoll * 85);
          const hasLevelUp = await Levels.appendXp(
            interaction.user.id,
            interaction.guild.id,
            winXp
          );
          gambleEmbed
            .setTitle(`Winner`)
            .setDescription(`${interaction.user} won **${winXp}** XP`)
            .setColor(0x46eb34)
            .setThumbnail(
              `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} won ${winXp} XP by rolling ${roll} `
          );
          if (hasLevelUp) {
            const user = await Levels.fetch(
              interaction.user.id,
              interaction.guild.id
            );
            console.log(
              `${interaction.user.username} just advanced to level ${user.level}`
            );
            channel.send(
              `🎊 ${interaction.user} just advanced to level **${user.level}** 🙌`
            );
          }
        }
      } else if (roll === 69) {
        if (user.level === 60) return;
        else {
          const winXp = parseInt(gambleRoll * 69);
          const hasLevelUp = await Levels.appendXp(
            interaction.user.id,
            interaction.guild.id,
            winXp
          );
          gambleEmbed
            .setTitle(`Winner`)
            .setDescription(`${interaction.user} won **${winXp}** XP`)
            .setColor(0x46eb34)
            .setThumbnail(
              `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} won ${winXp} XP by rolling ${roll} `
          );
          if (hasLevelUp) {
            const user = await Levels.fetch(
              interaction.user.id,
              interaction.guild.id
            );
            console.log(
              `${interaction.user.username} just advanced to level ${user.level}`
            );
            channel.send(
              `🎊 ${interaction.user} just advanced to level **${user.level}** 🙌`
            );
          }
        }
      } else if (roll === 13) {
        if (user.level === 60) return;
        else {
          let loseXp = parseInt(gambleRoll * 13);
          if (loseXp > user.xp) {
            loseXp = uesr.xp;
          }
          await Levels.subtractXp(
            interaction.user.id,
            interaction.guild.id,
            loseXp
          );
          gambleEmbed
            .setTitle(`Loser`)
            .setDescription(`${interaction.user} lost **${loseXp}** XP`)
            .setColor(0xe01010)
            .setThumbnail(
              `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} lost ${loseXp} XP by rolling ${roll} `
          );
        }
      } else if (roll === 7) {
        if (user.level === 60) return;
        else {
          const winXp = parseInt(gambleRoll * 7);
          const hasLevelUp = await Levels.appendXp(
            interaction.user.id,
            interaction.guild.id,
            winXp
          );
          gambleEmbed
            .setTitle(`Winner`)
            .setDescription(`${interaction.user} won **${winXp}** XP`)
            .setColor(0x46eb34)
            .setThumbnail(
              `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} won ${winXp} XP by rolling ${roll} `
          );
          if (hasLevelUp) {
            const user = await Levels.fetch(
              interaction.user.id,
              interaction.guild.id
            );
            console.log(
              `${interaction.user.username} just advanced to level ${user.level}`
            );
            channel.send(
              `🎊 ${interaction.user} just advanced to level **${user.level}** 🙌`
            );
          }
        }
      } else if (roll === 91) {
        if ((user.level = 60)) return;
        else {
          let loseXp = parseInt(gambleRoll * 91);
          if (loseXp > user.xp) {
            loseXp = uesr.xp;
          }
          await Levels.subtractXp(
            interaction.user.id,
            interaction.guild.id,
            loseXp
          );
          gambleEmbed
            .setTitle(`Loser`)
            .setDescription(`${interaction.user} lost **${loseXp}** XP`)
            .setColor(0xe01010)
            .setThumbnail(
              `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} lost ${loseXp} XP by rolling ${roll} `
          );
        }
      } else if (roll === 39) {
        if ((user.level = 60)) return;
        else {
          let loseXp = parseInt(gambleRoll * 39);
          if (loseXp > user.xp) {
            loseXp = uesr.xp;
          }
          await Levels.subtractXp(
            interaction.user.id,
            interaction.guild.id,
            loseXp
          );
          gambleEmbed
            .setTitle(`Loser`)
            .setDescription(`${interaction.user} lost **${loseXp}** XP`)
            .setColor(0xe01010)
            .setThumbnail(
              `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
            );
          await interaction.editReply({
            content: `🎲 ${interaction.user} rolls **${roll}** `,
            embeds: [gambleEmbed],
          });
          console.log(
            `${interaction.user.username} lost ${loseXp} XP by rolling ${roll} `
          );
        }
      }
    }
  },
};
