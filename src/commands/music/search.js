const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const playerDB = require("../../schemas/player-schema");
const { useMainPlayer, QueryType } = require("discord-player");
const { musicChannelID } = process.env;
const errorHandler = require("../../functions/handlers/handleErrors");
const queueCreator = require("../utils/createQueue");
const buttonCreator = require("../utils/createButtons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search in YouTube.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Input something to search about.")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    let success = false;
    let timer;

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.Speak
      )
    ) {
      errorHandler.handlePermissionError(interaction);
    } else if (!interaction.member.voice.channel) {
      errorHandler.handleVoiceChannelError(interaction);
    } else {
      const player = useMainPlayer();
      const query = interaction.options.getString("query", true);

      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_SEARCH,
      });

      if (!result.hasTracks()) {
        errorHandler.handleNoResultError(interaction);
      } else {
        const searchEmbed = await interaction.deferReply({
          fetchReply: true,
        });

        const isLink = interaction.options
          .getString("query")
          .startsWith("https");

        const resultLength = isLink ? 1 : 5;

        const resultString = result.tracks
          .slice(0, resultLength)
          .map((song, i) => {
            return `**${i + 1}.** \`[${song.duration}]\` [${song.title} -- ${
              song.author
            }](${song.url})`;
          })
          .join("\n");

        const embed = new EmbedBuilder()
          .setTitle(`🔎 Result`)
          .setDescription(`${resultString}`)
          .setColor(0xff0000)
          .setFooter({
            iconURL: `https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png`,
            text: `YouTube`,
          });

        await interaction.editReply({
          embeds: [embed],
        });
        success = true;

        const emojis = [`1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`];

        if (isLink) {
          searchEmbed.react(emojis[0]);
        } else {
          emojis.forEach((emoji) => {
            searchEmbed.react(emoji);
          });
        }

        const filter = (reaction, user) => {
          emojis.includes(reaction.emoji.name) &&
            user.id === interaction.user.id;
        };
        const collector = searchEmbed.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {
          const queue =
            client.player.nodes.get(interaction.guildId) ||
            queueCreator.createQueue(interaction, result);

          if (user.bot) return;
          if (!interaction.member.voice.channel) return;
          if (
            queue.connection.joinConfig.channelId !==
            interaction.member.voice.channel.id
          )
            return;

          if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel);
          }

          reaction.users.remove(reaction.users.cache.get(user.id));

          let song;
          switch (reaction.emoji.name) {
            case `1️⃣`:
              song = result.tracks[0];
              break;
            case `2️⃣`:
              song = result.tracks[1];
              break;
            case `3️⃣`:
              song = result.tracks[2];
              break;
            case `4️⃣`:
              song = result.tracks[3];
              break;
            case `5️⃣`:
              song = result.tracks[4];
              break;
          }

          try {
            await queue.addTrack(song);

            let queueSize = queue.tracks.size;

            if (!queue.node.isPlaying()) {
              queueSize = 0;
              await queue.node.play();
            }

            const nowPlaying = queueSize === 0;

            if (nowPlaying) {
              embed.setTitle("🎵 Now Playing");

              await playerDB.updateOne(
                { guildId: interaction.guildId },
                { isJustAdded: true }
              );
            } else {
              embed.setTitle(`🎵 Track #${queueSize}`);

              await playerDB.updateOne(
                { guildId: interaction.guildId },
                { isJustAdded: false }
              );
            }

            embed
              .setDescription(
                `**[${song.title}](${song.url})**\n**${song.author}**\n${song.duration}`
              )
              .setThumbnail(song.thumbnail);

            if (song.duration.length >= 7) {
              timer = 10 * 60;
            } else {
              const duration = song.duration;
              const convertor = duration.split(":");
              timer = +convertor[0] * 60 + +convertor[1];
            }

            if (timer > 10 * 60) timer = 10 * 60;
            if (timer < 1 * 60) timer = 1 * 60;

            const button = buttonCreator.createButtons(nowPlaying);

            await interaction
              .followUp({ embeds: [embed], components: [button] })
              .then((message) => {
                const timeoutLog = success
                  ? "Failed to delete Search interaction follow-up message."
                  : "Failed to delete unsuccessfull Search interaction follow-up message.";
                setTimeout(() => {
                  if (
                    success === true &&
                    interaction.channel.id === musicChannelID
                  )
                    message.edit({ components: [] });
                  else {
                    message.delete().catch((e) => {
                      console.log(timeoutLog);
                    });
                  }
                }, timer * 1000);
              });
            success = true;
          } catch (error) {
            if (
              error.message.includes("Sign in to confirm your age.") ||
              error.message.includes("The following content may contain")
            ) {
              errorHandler.handleRestriceError(interaction);
            } else if (
              error.message ===
                "Cannot read properties of null (reading 'createStream')" ||
              error.message.includes(
                "Failed to fetch resources for ytdl streaming"
              ) ||
              error.message.includes("Could not extract stream for this track")
            ) {
              errorHandler.handleThirdPartyError(interaction);
            } else {
              errorHandler.handleUnknownError(interaction);
            }
          }
        });
      }
    }
    const timeoutDuration = success ? 10 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? `Failed to delete ${interaction.commandName} interaction.`
      : `Failed to delete unsuccessfull ${interaction.commandName} interaction.`;
    setTimeout(() => {
      if (success === true && interaction.channel.id === musicChannelID) {
        searchEmbed.reactions.removeAll().catch((e) => {
          return;
        });
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(timeoutLog);
        });
      }
    }, timeoutDuration);
  },
};
