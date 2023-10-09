const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { musicChannelID } = process.env;
const errorHandler = require("../../utils/handleErrors");
const footerSetter = require("../../utils/setFooter");
const buttonCreator = require("../../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setDescription("Replay the currently playing track back from the top.")
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;
    let timer;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue || !queue.node.isPlaying()) {
      errorHandler.handleQueueError(interaction);
    } else {
      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        const song = queue.currentTrack;

        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }

        await queue.node.seek(0);

        const embed = new EmbedBuilder()
          .setTitle(`🔄 Replay`)
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
          )
          .setThumbnail(song.thumbnail)
          .setColor(0x25bfc4);

        footerSetter.setFooter(embed, song);

        const button = buttonCreator.createButtons(true);

        await interaction.editReply({ embeds: [embed], components: [button] });
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
      if (success && interaction.channel.id === musicChannelID) return;
      else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timer * 1000);
  },
};
