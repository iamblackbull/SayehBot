const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previously played track in the current queue."),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`Bot doesn't have the required permission!`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      interaction.reply({
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
    } else if (!queue || !queue.history) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(`There is no queue or queue history is not available.`)
        .setColor(0xffea00)
        .setThumbnail(
          `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        failedEmbed
          .setTitle(`**Busy**`)
          .setDescription(`Bot is busy in another voice channel.`)
          .setColor(0x256fc4)
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
          );
        interaction.reply({
          embeds: [failedEmbed],
        });
      } else {
        let embed = new EmbedBuilder();
        let nowPlaying = false;
        let public = false;

        await queue.history.back();
        if (!queue.node.isPlaying()) await queue.node.play();

        const song = queue.currentTrack;

        nowPlaying = queue.tracks.size === 1;

        if (nowPlaying) {
          embed.title(`🎵 Now Playing`);

          await playerDB.updateOne(
            { guildId: interaction.guildId },
            { isSkipped: true }
          );
        } else {
          embed.setTitle(`🎵 Previous`);
        }

        embed
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
          )
          .setThumbnail(song.thumbnail);

        if (song.url.includes("youtube")) {
          public = true;

          embed.setColor(0xff0000).setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });
        } else if (song.url.includes("spotify")) {
          embed.setColor(0x34eb58).setFooter({
            iconURL: `https://www.freepnglogos.com/uploads/spotify-logo-png/image-gallery-spotify-logo-21.png`,
            text: `Spotify`,
          });
        } else if (song.url.includes("soundcloud")) {
          embed.setColor(0xeb5534).setFooter({
            iconURL: `https://st-aug.edu/wp-content/uploads/2021/09/soundcloud-logo-soundcloud-icon-transparent-png-1.png`,
            text: `Soundcloud`,
          });
        } else if (song.url.includes("apple")) {
          embed.setColor(0xfb4f67).setFooter({
            iconURL: `https://music.apple.com/assets/knowledge-graph/music.png`,
            text: `Apple Music`,
          });
        }

        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }

        const skipButton = new ButtonBuilder()
          .setCustomId(`skipper`)
          .setEmoji(`⏭`)
          .setDisabled(!nowPlaying)
          .setStyle(ButtonStyle.Secondary);
        const favoriteButton = new ButtonBuilder()
          .setCustomId(`favorite`)
          .setEmoji(`🤍`)
          .setDisabled(!nowPlaying)
          .setStyle(ButtonStyle.Danger);
        const lyricsButton = new ButtonBuilder()
          .setCustomId(`lyrics`)
          .setEmoji(`🎤`)
          .setDisabled(!nowPlaying)
          .setStyle(ButtonStyle.Primary);

        const button = new ActionRowBuilder()
          .addComponents(skipButton)
          .addComponents(favoriteButton)
          .addComponents(lyricsButton);

        await interaction.editReply({
          embeds: [embed],
          components: [button],
        });
        success = true;
      }
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        interaction.editReply({ components: [] });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
