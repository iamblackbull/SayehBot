const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { musicChannelID } = process.env;
let success = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump to a certain track #")
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("Track # to jump to")
        .setMinValue(1)
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const queue = client.player.getQueue(interaction.guildId);
    let trackNum = interaction.options.getInteger("tracknumber");
    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Queue is empty. Add at least 1 song to the queue to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (!interaction.member.voice.channel) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `You need to be in a voice channel to use this command.`
        )
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else if (
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      if (trackNum > queue.tracks.length) {
        trackNum = queue.tracks.length;
      }
      queue.skipTo(trackNum - 1);
      const nextSong = queue.tracks.at(0);
      const addButton = new ButtonBuilder()
        .setCustomId(`favorite`)
        .setEmoji(`🤍`)
        .setStyle(ButtonStyle.Danger);
      const removeButton = new ButtonBuilder()
        .setCustomId(`remove-favorite`)
        .setEmoji(`💔`)
        .setStyle(ButtonStyle.Secondary);

      embed
        .setTitle(`⏭ Jump`)
        .setDescription(
          `**[${nextSong.title}](${nextSong.url})**\n**${nextSong.author}**\n${nextSong.duration}`
        )
        .setThumbnail(nextSong.thumbnail);
      if (nextSong.url.includes("youtube")) {
        embed.setColor(0xff0000).setFooter({
          iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
          text: `YouTube`,
        });
      } else if (nextSong.url.includes("spotify")) {
        embed.setColor(0x34eb58).setFooter({
          iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
          text: `Spotify`,
        });
      } else if (nextSong.url.includes("soundcloud")) {
        embed.setColor(0xeb5534).setFooter({
          iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
          text: `Soundcloud`,
        });
      }

      await interaction.reply({
        embeds: [embed],
        components: [
          new ActionRowBuilder()
            .addComponents(addButton)
            .addComponents(removeButton),
        ],
      });
      success = true;
    } else {
      failedEmbed
        .setTitle(`**Bot is busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          interaction.editReply({ components: [] });
        } else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, 10 * 60 * 1000);
  },
};
