const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a specific duration in the current track.")
    .addIntegerOption((options) => {
      return options
        .setName("minutes")
        .setDescription("Input a amount of minutes to seek.")
        .setMinValue(1)
        .setRequired(true);
    })
    .addIntegerOption((options) => {
      return options
        .setName("seconds")
        .setDescription("Input a amount of seconds to seek.")
        .setMinValue(1)
        .setMaxValue(59)
        .setRequired(false);
    })
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

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
        await interaction.deferReply({
          fetchReply: true,
        });

        const mins = interaction.options.getInteger("minutes");
        const seconds = interaction.options.getInteger("seconds") || 0;
        let amount = mins * 60 + seconds;

        const song = queue.currentTrack;
        const { timestamp } = useTimeline(interaction.guildId);

        const duration = song.duration;
        const convertor = duration.split(":");
        const totalTimer = +convertor[0] * 60 + +convertor[1];

        const currentDuration = timestamp.current.label;
        const currentConvertor = currentDuration.split(":");
        const currentTimer = +currentConvertor[0] * 60 + +currentConvertor[1];

        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          timer = totalTimer - currentTimer;
        }

        const maxMins = +convertor[0];
        const maxSecs = +convertor[1];

        if (mins > maxMins) amount = maxMins * 60;
        else if (mins === maxMins && seconds >= maxSecs) amount = maxMins * 60;

        await queue.node.seek(amount * 1000);

        setTimeout(async () => {
          const bar = queue.node.createProgressBar({
            timecodes: true,
            queue: false,
            length: 14,
          });

          const embed = new EmbedBuilder()
            .setTitle(`⏩ Seek`)
            .setDescription(
              `**[${song.title}](${song.url})**\n**${song.author}**\n` + bar
            )
            .setColor(0x25bfc4);

          await interaction.editReply({ embeds: [embed] });
          success = true;
        }, 1 * 1000);
      }
    }

    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;

    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
