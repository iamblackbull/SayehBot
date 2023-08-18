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
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),
  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

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
    } else {
      let embed = new EmbedBuilder().setTitle("🤖 Leveling System");
      const user = interaction.options.getUser("user");
      const userTarget = await Levels.fetch(
        user.id,
        interaction.guild.id,
        true
      );

      if (userTarget <= 0) {
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
        const action = interaction.options.get("action").value;
        const unit = interaction.options.get("unit").value;
        const amount = interaction.options.getInteger("amount");
        if (action === "give") {
          if (unit === "level") {
            await Levels.appendLevel(user.id, interaction.guild.id, amount);
            embed
              .setDescription(
                `Total of **${amount} levels** granted to ${user}`
              )
              .setColor(0x46eb34);
            console.log(
              `${interaction.user.username} added ${amount} levels to ${user.username}`
            );
          }

          if (unit === "xp") {
            await Levels.appendXp(user.id, interaction.guild.id, amount);
            embed
              .setDescription(`Total of **${amount} XP** granted to ${user}`)
              .setColor(0x46eb34);
            console.log(
              `${interaction.user.username} granted ${amount} XP to ${user.username}`
            );
          }
        } else {
          if (unit === "level") {
            await Levels.subtractLevel(user.id, interaction.guild.id, amount);
            embed
              .setDescription(
                `Total of **${amount} levels** removed from ${user}`
              )
              .setColor(0xe01010);
            console.log(
              `${interaction.user.username} removed ${amount} levels from ${user.username}`
            );
          }

          if (unit === "xp") {
            await Levels.subtractXp(user.id, interaction.guild.id, amount);
            embed
              .setDescription(`Total of **${amount} XP** removed from ${user}`)
              .setColor(0xe01010);
            console.log(
              `${interaction.user.username} removed ${amount} XP from ${user.username}`
            );
          }
        }
        await interaction.editReply({
          embeds: [embed],
        });
      }
    }
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete XP interaction.`);
      });
    }, 5 * 60 * 1000);
  },
};
