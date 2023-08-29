const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const oxr = require("oxr");
const service = oxr.factory({
  appId: "b8f4024e01c4429c9999be6f41fbf2de",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("currency")
    .setDescription("Returns latest currencies exchange rates to IRR"),

  async execute(interaction, client) {
    await interaction.deferReply({
      fetchReply: true,
    });

    service
      .latest()
      .then(async function (result) {
        const rates = `
        :flag_ae: AED = **${Math.round(
          result.rates.IRR / result.rates.AED
        )}** IRR :flag_ir:\n
        :flag_ca: CAD = **${Math.round(
          result.rates.IRR / result.rates.CAD
        )}** IRR :flag_ir:\n
        :flag_cn: CNY = **${Math.round(
          result.rates.IRR / result.rates.CNY
        )}** IRR :flag_ir:\n
        :flag_eu: EUR = **${Math.round(
          result.rates.IRR / result.rates.EUR
        )}** IRR :flag_ir:\n
        :flag_gb: GBP = **${Math.round(
          result.rates.IRR / result.rates.GBP
        )}** IRR :flag_ir:\n
        :flag_tr: TRY = **${Math.round(
          result.rates.IRR / result.rates.TRY
        )}** IRR :flag_ir:\n
        :flag_us: USD = **${result.rates.IRR}** IRR :flag_ir:
        `;

        const embed = new EmbedBuilder()
          .setTitle(`**Exchange to IRR**`)
          .setColor(0x2ae83d)
          .setThumbnail(
            `https://freepngimg.com/download/money/48807-7-exchange-png-file-hd.png`
          )
          .setDescription(
            `Data is based on official reports of goverment and obviously not legit.\n${rates}`
          )
          .setTimestamp(Date.now())
          .setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/dollar-sign-png/dollar-sign-finance-dollar-financial-world-image-pixabay-0.png`,
            text: `Currencies`,
          });

        await interaction.editReply({
          embeds: [embed],
        });
      })
      .catch(async (e) => {
        const failedEmbed = new EmbedBuilder()
          .setTitle(`**No Response**`)
          .setDescription(
            `Currency API did not respond.\nTry again later with </currency:1100722765587284050>.`
          )
          .setColor(0xffea00)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
          );

        await interaction.editReply({
          embeds: [failedEmbed],
        });
      });
      
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
