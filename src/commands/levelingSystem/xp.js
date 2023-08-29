const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Levels = require("discord-xp");
const { mongoose } = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Manage user level and XP")
    .addStringOption((option) => {
      return option
        .setName("action")
        .setDescription("Choose action")
        .setRequired(true)
        .addChoices(
          {
            name: "Give",
            value: "granted",
          },
          {
            name: "Take",
            value: "removed",
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
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const userLevel = await Levels.fetch(user.id, interaction.guild.id, true);

    let failedEmbed = new EmbedBuilder().setColor(0xffea00);

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(
          `Connection to database has been timed out.\nTry again later with </xp:1047903144752984071>.`
        )
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else if (userLevel <= 0) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `${user} has not gained enough xp. User should at least send **1** message in the server.`
        )
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      let embed = new EmbedBuilder().setTitle("🤖 Leveling System");

      let action = interaction.options.get("action").value;
      let unit = interaction.options.get("unit").value;
      const amount = interaction.options.getInteger("amount");

      if (action === "granted") {
        action = "granted to";
        embed.setColor(0x46eb34);

        if (unit === "level") {
          await Levels.appendLevel(user.id, interaction.guild.id, amount);
        } else {
          unit = "XP";
          await Levels.appendXp(user.id, interaction.guild.id, amount);
        }
      } else {
        action = "removed from";
        embed.setColor(0xe01010);

        if (unit === "level") {
          await Levels.subtractLevel(user.id, interaction.guild.id, amount);
        } else {
          unit = "XP";
          await Levels.subtractXp(user.id, interaction.guild.id, amount);
        }
      }

      embed.setDescription(`**${amount} ${unit}** ${action} ${user}`);

      await interaction.editReply({
        embeds: [embed],
      });

      console.log(
        `${amount} ${unit} ${action} ${user} by ${interaction.user.username}.`
      );
    }

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 5 * 60 * 1000);
  },
};
