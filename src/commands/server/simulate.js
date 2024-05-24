const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Events,
} = require("discord.js");
const utils = require("../../utils/main/mainUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simulate")
    .setDescription("Simulate an event triggeration to test the bot.")
    .addStringOption((option) =>
      option
        .setName("event")
        .setDescription("Select the event you want to trigger.")
        .setRequired(true)
        .addChoices(
          {
            name: "Welcome",
            value: Events.GuildMemberAdd,
          },
          {
            name: "Leave",
            value: Events.GuildMemberRemove,
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    const event = interaction.options.get("event").value;
    client.emit(event, interaction.member);

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.simulate)
      .setDescription("Event has been triggered successfully.")
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.success)
      .setFooter({
        text: utils.texts.tools,
        iconURL: utils.footers.tools,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
