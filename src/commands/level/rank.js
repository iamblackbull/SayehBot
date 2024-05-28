const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { DBTOKEN, rankChannelID } = process.env;
const errorHandler = require("../../utils/main/handleErrors");
const { generateCard } = require("../../utils/level/generateCard");
const { handleNonMusicalDeletion } = require("../../utils/main/handleDeletion");
const { mongoose } = require("mongoose");
const Levels = require("discord-xp");

Levels.setURL(DBTOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Get a user rank card")
    .addUserOption((option) =>
      option.setName("user").setDescription("Pick a member").setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const memberTarget = interaction.guild.members.cache.get(target.id);
    const user = await Levels.fetch(target.id, interaction.guild.id, true);
    const qualified = user.xp > 0;
    let success = false;

    if (mongoose.connection.readyState !== 1) {
      errorHandler.handleDatabaseError(interaction);
    } else if (!qualified) {
      errorHandler.handleXpError(interaction, target);
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { canvas } = await generateCard(target, memberTarget, user);

      const attachment = new AttachmentBuilder(canvas.toBuffer());

      interaction.editReply({
        files: [attachment],
      });

      success = true;
    }

    handleNonMusicalDeletion(interaction, success, rankChannelID, 5);
  },
};
