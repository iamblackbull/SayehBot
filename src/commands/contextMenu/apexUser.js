const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
} = require("discord.js");
const { TrackerClient } = require("tracker.gg");
const api = new TrackerClient({
  apiKey: `0b70205c-ab93-4b35-9842-59fd97f58558`,
});
const apex = require("../../schemas/apex-schema");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get apex stats")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    const apexEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let failedEmbed = new EmbedBuilder();

    let apexList = await apex.findOne({
      User: interaction.targetUser.id,
    });
    if (!apexList) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `${interaction.targetUser} doesn't have any Apex Account saved in the database.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      const username = apexList.ApexUsername;
      const platform = apexList.ApexPlatform;
      await api
        .getApexPlayerStats(`${platform}`, `${username}`)
        .then((result) => {
          let embed = new EmbedBuilder()
            .setTitle(`**${result.data.pInfo.platformUserID}**`)
            .setURL(
              `https://apex.tracker.gg/apex/profile/origin/${result.data.pInfo.platformUserID}/overview`
            )
            .setDescription(`Kills & Damage Data might not be accurate!`)
            .setThumbnail(
              `${result.data.segments[0].stats.rankScore.metadata.iconUrl}`
            )
            .setColor(0xff0000)
            .setFooter({
              iconURL: `https://seeklogo.com/images/A/apex-logo-C3478A4601-seeklogo.com.png`,
              text: `Apex Legends`,
            })
            .addFields(
              {
                name: `Level`,
                value: `${result.data.segments[0].stats.level.value}`,
                inline: true,
              },
              {
                name: `Kills`,
                value: `${result.data.segments[0].stats.kills.value}`,
                inline: true,
              },
              {
                name: `Damage`,
                value: `${result.data.segments[0].stats.damage.value}`,
                inline: true,
              },
              {
                name: `Active Legend`,
                value: `${result.data.metadata.activeLegendName}`,
                inline: true,
              },
              {
                name: `Rank`,
                value: `${result.data.segments[0].stats.rankScore.metadata.rankName} (${result.data.segments[0].stats.rankScore.value})`,
                inline: true,
              }
            );
          interaction.editReply({
            embeds: [embed],
          });
        })
        .catch((e) => {
          failedEmbed
            .setTitle(`**No results**`)
            .setDescription(`Please try again later.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        });
      setTimeout(() => {
        interaction.deleteReply().catch(console.error);
      }, 10 * 60 * 1000);
    }
  },
};
