const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("song")
    .setDescription("Get info about the current track.")
    .setDMPermission(false),

  async execute(interaction, client) {
    let queue = client.player.nodes.get(interaction.guildId);

    const sameChannel =
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id;

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

    if (!queue) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `Bot is already not playing in any voice channel.\nUse </play:1047903145071759425> to play a track.`
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
    } else if (!sameChannel) {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.reply({
        embeds: [failedEmbed],
      });
    } else {
      await interaction.deferReply({
        fetchReply: true,
      });

      const { timestamp } = useTimeline(interaction.guildId);
      let source;

      let bar = queue.node.createProgressBar({
        timecodes: true,
        queue: false,
        length: 14,
      });

      let song = queue.currentTrack;

      let embed = new EmbedBuilder()
        .setTitle("🎵 **Currently Playing**")
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
        )
        .setColor(0x25bfc4);

      if (song.url.includes("spotify") || song.url.includes("apple"))
        source = "private";
      else source = "public";

      if (song.duration.length >= 7) {
        timer = 10 * 60;
      } else {
        const duration = song.duration;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;
      }

      const previousButton = new ButtonBuilder()
        .setCustomId(`previous-button`)
        .setEmoji(`⏮`)
        .setStyle(ButtonStyle.Secondary);
      const pauseButton = new ButtonBuilder()
        .setCustomId(`pause-button`)
        .setEmoji(`⏸`)
        .setStyle(ButtonStyle.Secondary);
      const skipButton = new ButtonBuilder()
        .setCustomId(`skipper`)
        .setEmoji(`⏭`)
        .setStyle(ButtonStyle.Secondary);
      const favoriteButton = new ButtonBuilder()
        .setCustomId(`favorite`)
        .setEmoji(`🤍`)
        .setStyle(ButtonStyle.Danger);
      const lyricsButton = new ButtonBuilder()
        .setCustomId(`lyrics`)
        .setEmoji(`🎤`)
        .setStyle(ButtonStyle.Primary);
      const downloadButton = new ButtonBuilder()
        .setCustomId(`downloader`)
        .setEmoji(`⬇`)
        .setStyle(ButtonStyle.Secondary);

      const button = new ActionRowBuilder()
        .addComponents(previousButton)
        .addComponents(pauseButton)
        .addComponents(skipButton)
        .addComponents(timer < 10 * 60 ? favoriteButton : null)
        .addComponents(lyricsButton)
        .addComponents(
          timer < 10 * 60 && source === public ? downloadButton : null
        );

      await interaction.editReply({
        embeds: [embed],
        components: [button],
      });
      success = true;
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
