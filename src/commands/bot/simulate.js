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
    .setDescription(`${utils.tags.mod} Simulate an event triggeration`)
    .addStringOption((option) =>
      option
        .setName("event")
        .setDescription("Select an event")
        .setRequired(true)
        .addChoices(
          {
            name: utils.events.welcome,
            value: Events.GuildMemberAdd,
          },
          {
            name: utils.events.leave,
            value: Events.GuildMemberRemove,
          }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction, client) {
    const event = interaction.options.get("event").value;
    await client.emit(event, interaction.member);

    const embed = new EmbedBuilder()
      .setTitle(utils.titles.simulate)
      .setDescription("Event has been triggered successfully.")
      .setColor(utils.colors.default)
      .setThumbnail(utils.thumbnails.success)
      .setFooter({
        text: utils.texts.bot,
        iconURL: utils.footers.bot,
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
