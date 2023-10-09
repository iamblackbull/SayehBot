const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { musicChannelID } = process.env;
const errorHandler = require("../../functions/handlers/handleErrors");
const footerSetter = require("../utils/setFooter");
const buttonCreator = require("../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump to a certain track number.")
    .addIntegerOption((option) =>
      option
        .setName("tracknumber")
        .setDescription("Input a track number to jump.")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    const queue = client.player.nodes.get(interaction.guildId);

    let success = false;
    let timer;

    if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else if (!queue) {
      errorHandler.handleQueueError(interaction);
    } else {
      let embed = new EmbedBuilder();

      const sameChannel =
        queue.connection.joinConfig.channelId ===
        interaction.member.voice.channel.id;

      if (!sameChannel) {
        errorHandler.handleBusyError(interaction);
      } else {
        await interaction.deferReply({
          fetchReply: true,
        });

        let trackNum = interaction.options.getInteger("tracknumber");
        if (trackNum > queue.tracks.size) {
          trackNum = queue.tracks.size;
        }

        queue.node.skipTo(trackNum - 1);
        if (!queue.node.isPlaying()) await queue.node.play();

        const song = queue.tracks.at(0);

        await playerDB.updateOne(
          { guildId: interaction.guildId },
          { isSkipped: true }
        );

        embed
          .setTitle(`⏭ Jump`)
          .setDescription(
            `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
          )
          .setThumbnail(song.thumbnail);

        footerSetter.setFooter(embed, song);

        if (song.duration.length >= 7) {
          timer = 10 * 60;
        } else {
          const duration = song.duration;
          const convertor = duration.split(":");
          timer = +convertor[0] * 60 + +convertor[1];
        }

        button = buttonCreator.createButtons(true);

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
