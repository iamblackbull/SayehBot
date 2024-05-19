const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { handleInteractionCommand } = require("../../utils/level/handleLevel");
const { mongoose } = require("mongoose");
const { DBTOKEN } = process.env;
const Levels = require("discord-xp");
Levels.setURL(DBTOKEN);

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

      const { updatedAction, updatedUnit } = await handleInteractionCommand(
        interaction,
        amount,
        action,
        unit
      );

      action === "granted"
        ? embed.setColor(0x46eb34)
        : embed.setColor(0xe01010);

      embed.setDescription(
        `**${amount} ${updatedUnit}** ${updatedAction} ${user}`
      );

      await interaction.editReply({
        embeds: [embed],
      });
    }

    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 5 * 60 * 1000);
  },
};
