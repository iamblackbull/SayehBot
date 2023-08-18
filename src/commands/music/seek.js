const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useTimeline } = require("discord-player");
const { musicChannelID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek through the current song")
    .addIntegerOption((options) => {
      return options
        .setName("minutes")
        .setDescription("Minutes to seek")
        .setMinValue(1)
        .setRequired(true);
    })
    .setDMPermission(false),
  async execute(interaction, client) {
    const seekEmbed = await interaction.deferReply({
      fetchReply: true,
    });
    let mins = interaction.options.getInteger("minutes");
    const queue = client.player.nodes.get(interaction.guildId);

    let failedEmbed = new EmbedBuilder();
    let success = false;
    let timer;

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
      await interaction.editReply({
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
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    } else if (
      queue.connection.joinConfig.channelId ===
      interaction.member.voice.channel.id
    ) {
      const song = queue.currentTrack;
      queue.seek(parseInt(mins) * 60 * 1000);
      let embed = new EmbedBuilder()
        .setTitle(`⏩ Seek`)
        .setDescription(
          `**[${song.title}](${song.url})**\n**${song.author}**\n${mins}:00 to ${song.duration}`
        )
        .setThumbnail(`${song.thumbnail}`)
        .setColor(0x25bfc4);
      seekEmbed.react(`⏮`);
      const filter = (reaction, user) => {
        [`⏮`].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };
      const collector = seekEmbed.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          queue.seek(parseInt(0) * 60 * 1000);
          embed.setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n00:00 to ${song.duration}`
          );
          await interaction.editReply({
            embeds: [embed],
          });
          success = true;
        }
      });
      await interaction.editReply({ embeds: [embed] });
      success = true;
      const { timestamp } = useTimeline(interaction.guildId);
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
    } else {
      failedEmbed
        .setTitle(`**Busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    }
    success ? timer : (timer = 2 * 60);
    if (timer > 10 * 60) timer = 10 * 60;
    if (timer < 1 * 60) timer = 1 * 60;
    const timeoutLog = success
      ? "Failed to delete Seek interaction."
      : "Failed to delete unsuccessfull Seek interaction.";
    setTimeout(() => {
      if (success && interaction.channel.id === musicChannelID) {
        seekEmbed.reactions
          .removeAll()
          .catch((error) =>
            console.error(
              chalk.red("Failed to clear reactions from Seek interaction."),
              error
            )
          );
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
