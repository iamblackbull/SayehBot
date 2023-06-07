const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const { TrackerClient } = require("tracker.gg");
const api = new TrackerClient({
  apiKey: `0b70205c-ab93-4b35-9842-59fd97f58558`,
});
const apex = require("../../schemas/apex-schema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apex")
    .setDescription("Returns Apex Legends Stats")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Input EA username")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("platform")
        .setDescription("Select your platform")
        .setRequired(true)
        .addChoices(
          {
            name: "PC",
            value: "pc",
          },
          {
            name: "Play Station",
            value: "psn",
          },
          {
            name: "Xbox",
            value: "xbl",
          }
        )
    ),
  async execute(interaction, client) {
    const apexEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    const username = interaction.options.getString("username");
    let platform;
    if (interaction.options.get("platform").value === "pc") platform = `origin`;
    if (interaction.options.get("platform").value === "psn") platform = `psn`;
    if (interaction.options.get("platform").value === "xbl") platform = `xbl`;
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
        const saveButton = new ButtonBuilder()
          .setCustomId(`apex`)
          .setLabel(`Save`)
          .setStyle(ButtonStyle.Success);

        apexEmbed
          .awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 10 * 60 * 1000,
          })

          .then(async (interaction) => {
            let apexList = await apex.findOne({
              User: interaction.user.id,
            });

            const saveEmbed = new EmbedBuilder()
              .setTitle(`Save Account`)
              .setDescription(
                "Your Apex Account have been saved to the database."
              )
              .setColor(0x25bfc4)
              .setThumbnail(
                `https://freeiconshop.com/wp-content/uploads/edd/link-open-flat.png`
              )
              .setFooter({
                iconURL: `https://seeklogo.com/images/A/apex-logo-C3478A4601-seeklogo.com.png`,
                text: `Apex Legends`,
              });

            if (!apexList) {
              apexList = new apex({
                User: interaction.user.id,
                ApexUsername: username,
                ApexPlatform: platform,
              });
              await apexList.save().catch(console.error);
              await interaction.reply({
                embeds: [saveEmbed],
                ephemeral: true,
              });
              console.log(
                `${interaction.user.tag} just saved their Apex Account to the database.`
              );
            } else {
              apexList = await apex.findOneAndDelete({
                User: interaction.user.id,
              });
              const newApexList = new apex({
                User: interaction.user.id,
                ApexUsername: username,
                ApexPlatform: platform,
              });
              await newApexList.save().catch(console.error);
              await interaction.reply({
                embeds: [saveEmbed],
                ephemeral: true,
              });
              console.log(
                `${interaction.user.tag} just edited their Apex Account in the database.`
              );
            }
          })
          .catch((e) => {
            console.log(
              `Save collector of Apex did not recieve any interactions before ending.`
            );
          });
        interaction.editReply({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(saveButton)],
        });
      })
      .catch((e) => {
        let failedEmbed = new EmbedBuilder()
          .setTitle(`**No Result**`)
          .setDescription(`Make sure you input the correct informations.`)
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      });
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete Apex interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
