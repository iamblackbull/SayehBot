const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Gigulebalaha, ShadowxRole, HamitzRole } = process.env;
const Levels = require("discord-xp");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Manage user level and XP (moderators-only)")
    .addStringOption((option) => {
      return option
        .setName("action")
        .setDescription("Choose action")
        .setRequired(true)
        .addChoices(
          {
            name: "Give",
            value: "give",
          },
          {
            name: "Take",
            value: "take",
          }
        );
    })
    .addStringOption((option) => {
      return option
        .setName("unit")
        .setDescription("Choose unit")
        .setRequired(true)
        .addChoices(
          {
            name: "Level",
            value: "level",
          },
          {
            name: "XP",
            value: "xp",
          }
        );
    })
    .addIntegerOption((option) => {
      return option
        .setName("amount")
        .setDescription("Amount of level / XP")
        .setRequired(true);
    })
    .addUserOption((option) => {
      return option
        .setName("user")
        .setDescription("Pick any member")
        .setRequired(true);
    }),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });
    let failedEmbed = new EmbedBuilder();
    const member = interaction.member;
    let embed = new EmbedBuilder().setTitle("🤖 Leveling System");
    const user = interaction.options.getUser("user");
    const userTarget = await Levels.fetch(user.id, interaction.guild.id, true);
    if (!member.roles.cache.has(Gigulebalaha || ShadowxRole || HamitzRole)) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`You don't have the required role!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else if (userTarget <= 0) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `${user} has not gained enough xp. You should at least send 1 message in the server.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      if (interaction.options.get("action").value === "give") {
        if (interaction.options.get("unit").value === "level") {
          const level = interaction.options.getInteger("amount");
          await Levels.appendLevel(user.id, interaction.guild.id, level);
          embed
            .setDescription(`Total of **${level} levels** granted to ${user}`)
            .setColor(0x46eb34);
          console.log(
            `${interaction.user.tag} added ${level} levels to ${user.tag}`
          );
        }

        if (interaction.options.get("unit").value === "xp") {
          const XP = interaction.options.getInteger("amount");
          await Levels.appendXp(user.id, interaction.guild.id, XP);
          embed
            .setDescription(`Total of **${XP} XP** granted to ${user}`)
            .setColor(0x46eb34);
          console.log(
            `${interaction.user.tag} granted ${XP} XP to ${user.tag}`
          );
        }
      }

      if (interaction.options.get("action").value === "take") {
        if (interaction.options.get("unit").value === "level") {
          const level = interaction.options.getInteger("amount");
          await Levels.subtractLevel(user.id, interaction.guild.id, level);
          embed
            .setDescription(`Total of **${level} levels** removed from ${user}`)
            .setColor(0xe01010);
          console.log(
            `${interaction.user.tag} removed ${level} levels from ${user.tag}`
          );
        }

        if (interaction.options.get("unit").value === "xp") {
          const XP = interaction.options.getInteger("amount");
          await Levels.subtractXp(user.id, interaction.guild.id, XP);
          embed
            .setDescription(`Total of **${XP} XP** removed from ${user}`)
            .setColor(0xe01010);
          console.log(
            `${interaction.user.tag} removed ${XP} XP from ${user.tag}`
          );
        }
      }
      await interaction.editReply({
        embeds: [embed],
      });
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete XP interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
