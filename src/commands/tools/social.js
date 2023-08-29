const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("social")
    .setDescription("Returns Sayeh social links"),

  async execute(interaction, client) {
    const twitchButton = new ButtonBuilder()
      .setLabel(`Twitch`)
      .setURL(`https://twitch.tv/Sayeh`)
      .setStyle(ButtonStyle.Link);
    const youtubeButton = new ButtonBuilder()
      .setLabel(`YouTube`)
      .setURL(`https://youtube.com/c/Sayehh/?sub_confirmation=1`)
      .setStyle(ButtonStyle.Link);
    const instagramButton = new ButtonBuilder()
      .setLabel(`Instagram`)
      .setURL(`https://www.instagram.com/sayeh_game`)
      .setStyle(ButtonStyle.Link);
    const telegramButton = new ButtonBuilder()
      .setLabel("Telegram")
      .setURL(`https://t.me/sayeh_game`)
      .setStyle(ButtonStyle.Link);

    let embed = new EmbedBuilder()
      .setTitle(`Follow & Subscribe now!`)
      .setDescription(`Don't forget to follow Sayeh on social media!`)
      .setFields(
        { name: `Twitch`, value: `/Sayeh`, inline: true },
        { name: `YouTube`, value: `@Say3h`, inline: true },
        { name: `Telegram`, value: `@sayeh_game`, inline: true }
      )
      .setColor(0x25bfc4)
      .setURL(`https://twitch.tv/Sayeh`)
      .setThumbnail(
        `https://cdn.discordapp.com/attachments/760838336205029416/1089626902832107590/934476feaab28c0f586b688264b50041.webp`
      )
      .setFooter({
        iconURL: `https://www.pngkey.com/png/full/235-2350076_gmw-host-clipart-library-people-icon-png-white.png`,
        text: `Socials `,
      });

    const button = new ActionRowBuilder()
      .addComponents(twitchButton)
      .addComponents(youtubeButton)
      .addComponents(telegramButton);

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });
    
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(`Failed to delete ${interaction.commandName} interaction.`);
      });
    }, 10 * 60 * 1000);
  },
};
