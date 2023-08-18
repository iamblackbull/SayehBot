const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear an amount of messages in a channel")
    .addIntegerOption((options) => {
      return options
        .setName("amount")
        .setMinValue(1)
        .setMaxValue(99)
        .setDescription("Amount of messages to clear")
        .setRequired(true);
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  async execute(interaction, client) {
    const member = interaction.member;

    let failedEmbed = new EmbedBuilder();
    let amount = interaction.options.getInteger("amount");

    try {
      await interaction.channel.bulkDelete(amount);

      let embed = new EmbedBuilder()
        .setTitle(`🚮 Clear`)
        .setDescription(`**${amount}** messages successfully cleared.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://static.wikia.nocookie.net/logopedia/images/f/fe/Recycle_Bin_Windows_11_empty.png/revision/latest/scale-to-width-down/250?cb=20210616182845`
        );

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`You can't clear messages older than **14** days.\nTry again with </clear:1047903145218547871>.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
        embeds: [failedEmbed],
        ephemeral: true,
      });
    }
  },
};
