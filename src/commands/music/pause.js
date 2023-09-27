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
    .setName("pause")
    .setDescription("Pause / Resume the current track")
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    const { timestamp, paused, pause, resume } = useTimeline(
      interaction.guildId
    );

    let failedEmbed = new EmbedBuilder();
    let embed = new EmbedBuilder();
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
        await interaction.reply({
          embeds: [failedEmbed],
        });
      } else {
        if (!paused) {
          await pause();

          embed
            .setTitle(`Paused`)
            .setDescription(
              "Use </pause:1047903145071759424> again or click the button below to resume the music."
            )
            .setColor(0x256fc4)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/148/148746.png`
            );
        } else {
          await resume();
          if (!queue.node.isPlaying()) await queue.node.play();

          embed
            .setTitle(`Resumed`)
            .setDescription(
              "Use </pause:1047903145071759424> again or click the button below to pause the music."
            )
            .setColor(0x256fc4)
            .setThumbnail(
              `https://www.freepnglogos.com/uploads/play-button-png/index-media-cover-art-play-button-overlay-5.png`
            );
        }

        const duration = timestamp.total.label;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        timer = totalTimer - currentTimer;

        const pauseButton = new ButtonBuilder()
          .setCustomId(`pause-button`)
          .setEmoji(`⏸`)
          .setStyle(ButtonStyle.Secondary);

        const button = new ActionRowBuilder().addComponents(pauseButton);

        await interaction.reply({
          embeds: [embed],
          components: [button],
        });
        success = true;
      }
    }

    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutDuration = success ? timer * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        pauseEmbed.reactions.removeAll();
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
