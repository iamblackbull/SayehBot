const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Levels = require("discord-xp");
const { rankChannelID, guildID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a random number between 1 - 100")
    .setDMPermission(false),

  async execute(interaction, client) {
    let roll = Math.floor(Math.random() * 100) + 1;

    roll > 100 ? (roll = 100) : roll < 1 ? (roll = 1) : roll;

    await interaction.reply({
      content: `🎲 ${interaction.user} rolls **${roll}** `,
    });
    
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 2 * 60 * 1000);

    const target = interaction.user;
    const user = await Levels.fetch(target.id, interaction.guild.id, true);
    const guild = await client.guilds.fetch(guildID).catch(console.error);
    const channel = guild.channels.cache.get(rankChannelID);

    if (user.xp > 0 && user.level !== 60) {
      let gambleRoll = Math.floor(Math.random() * 10) + 1;

      let gambleEmbed = new EmbedBuilder().setFooter({
        iconURL: `https://cdn-icons-png.flaticon.com/512/831/831184.png`,
        text: `Gamble`,
      });

      gambleRoll > 10
        ? (gambleRoll = 10)
        : gambleRoll < 1
        ? (gambleRoll = 1)
        : gambleRoll;

      let type;
      let amount;

      switch (roll) {
        case 1:
          type = "loser";
          amount = gambleRoll * 100;
          break;
        case 7:
          type = "winner";
          amount = gambleRoll * 7;
          break;
        case 13:
          type = "loser";
          amount = gambleRoll * 13;
          break;
        case 20:
          type = "loser";
          amount = gambleRoll * 20;
          break;
        case 32:
          type = "winner";
          amount = gambleRoll * 32;
          break;
        case 39:
          type = "loser";
          amount = gambleRoll * 39;
          break;
        case 47:
          type = "loser";
          amount = gambleRoll * 32;
          break;
        case 50:
          gambleRoll >= 5 ? (type = "winner") : (type = "loser");
          amount = gambleRoll * 50;
          break;
        case 57:
          type = "loser";
          amount = gambleRoll * 57;
          break;
        case 61:
          type = "loser";
          amount = gambleRoll * 32;
          break;
        case 69:
          type = "winner";
          amount = gambleRoll * 69;
          break;
        case 85:
          type = "winner";
          amount = gambleRoll * 85;
          break;
        case 91:
          type = "winner";
          amount = gambleRoll * 91;
          break;
        case 95:
          type = "winner";
          amount = gambleRoll * 32;
          break;
        case 100:
          type = "winner";
          amount = gambleRoll * 100;
          break;

        default:
          type = "none";
      }

      if (type === "none") return;

      let XP = parseInt(amount);

      if (type === "winner") {
        const hasLevelUp = await Levels.appendXp(
          interaction.user.id,
          interaction.guild.id,
          XP
        );

        gambleEmbed
          .setTitle(`Winner`)
          .setDescription(`${interaction.user} won **${XP}** XP`)
          .setColor(0x46eb34)
          .setThumbnail(
            `https://cdn1.iconfinder.com/data/icons/casino-and-gambling-4/50/Casino_and_Gambling_Colored-09-512.png`
          );

        await interaction.editReply({
          content: `🎲 ${interaction.user} rolls **${roll}** `,
          embeds: [gambleEmbed],
        });

        console.log(
          `${interaction.user.username} won ${XP} XP by rolling ${roll} `
        );
        if (hasLevelUp) {
          const leveluppedUser = await Levels.fetch(
            interaction.user.id,
            interaction.guild.id
          );

          console.log(
            `${interaction.user.uesrname} just advanced to Level ${leveluppedUser.level}`
          );

          channel.send(
            `🎊 ${interaction.user} just advanced to Level **${leveluppedUser.level}** 🙌`
          );
        }
      } else if (type === "loser") {
        XP > user.xp ? (XP = user.xp - 1) : XP;

        await Levels.subtractXp(interaction.user.id, interaction.guild.id, XP);

        gambleEmbed
          .setTitle(`Loser`)
          .setDescription(`${interaction.user} lost **${XP}** XP`)
          .setColor(0xe01010)
          .setThumbnail(
            `https://www.inventicons.com/uploads/iconset/669/wm/512/Deslikelose-78.png`
          );

        await interaction.editReply({
          content: `🎲 ${interaction.user} rolls **${roll}** `,
          embeds: [gambleEmbed],
        });

        console.log(
          `${interaction.user.username} lost ${XP} XP by rolling ${roll} `
        );
      }
    }
  },
};
