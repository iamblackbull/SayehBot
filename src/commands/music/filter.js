const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { AudioFilters } = require("discord-player");
const { musicChannelID } = process.env;
let filterMode = false;
let success = false;

AudioFilters.define(
  "8D",
  "apulsator=hz=0.128",
  "bassboost_low",
  "vaporwave",
  "nightcore",
  "reverse",
  "earrape",
  "fadein",
  "karaoke",
  "vibrato"
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Change current filter of the queue")
    .addStringOption((option) => {
      return option
        .setName("effect")
        .setDescription("Choose effect")
        .setRequired(true)
        .addChoices(
          {
            name: "⚛ 8D",
            value: "8d",
          },
          {
            name: "🎧 Bassboost",
            value: "bassboost",
          },
          {
            name: "🐌 Vaporwave",
            value: "vaporwave",
          },
          {
            name: "💨 Nightcore",
            value: "nightcore",
          },
          {
            name: "◀ Reverse",
            value: "reverse",
          },
          {
            name: "⤴ Fade-In",
            value: "fadein",
          },
          {
            name: "🎤 Karaoke",
            value: "karaoke",
          },
          {
            name: "📳 Vibrato",
            value: "vibrato",
          },
          {
            name: "👂 Earrape",
            value: "earrape",
          },
          {
            name: "❌ Remove",
            value: "remove",
          }
        );
    }),
  async execute(interaction, client) {
    const filterEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let embed = new EmbedBuilder()
      .setColor(0xc42577)
      .setTitle("✨ Current Filter");

    let failedEmbed = new EmbedBuilder();

    const queue = client.player.getQueue(interaction.guildId);

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
      queue.connection.channel.id === interaction.member.voice.channel.id
    ) {
      if (interaction.options.get("effect").value === "8d") {
        queue.setFilters({ "8D": true });
        filterMode = true;
        embed.setDescription("⚛ 8D");
      } else if (interaction.options.get("effect").value === "bassboost") {
        queue.setFilters({ bassboost_low: true });
        filterMode = true;
        embed.setDescription("🎧 Bassboost");
      } else if (interaction.options.get("effect").value === "reverse") {
        queue.setFilters({ reverse: true });
        filterMode = true;
        embed.setDescription("◀ Reverse!");
      } else if (interaction.options.get("effect").value === "vaporwave") {
        queue.setFilters({ vaporwave: true });
        filterMode = true;
        embed.setDescription("🐌 Vaporwave");
      } else if (interaction.options.get("effect").value === "nightcore") {
        queue.setFilters({ nightcore: true });
        filterMode = true;
        embed.setDescription("💨 Nightcore");
      } else if (interaction.options.get("effect").value === "fadein") {
        queue.setFilters({ fadein: true });
        filterMode = true;
        embed.setDescription("⤴ Fade-In");
      } else if (interaction.options.get("effect").value === "karaoke") {
        queue.setFilters({ karaoke: true });
        filterMode = true;
        embed.setDescription("🎤 Karaoke");
      } else if (interaction.options.get("effect").value === "vibrato") {
        queue.setFilters({ vibrato: true });
        filterMode = true;
        embed.setDescription("📳 Vibrato");
      } else if (interaction.options.get("effect").value === "earrape") {
        queue.setFilters({ earrape: true });
        filterMode = true;
        embed.setDescription("👂 Earrape");
      } else if (interaction.options.get("effect").value === "remove") {
        if (filterMode === true) {
          queue.setFilters({
            "8D": false,
            bassboost_low: false,
            reverse: false,
            vaporwave: false,
            nightcore: false,
            earrape: false,
            fadein: false,
            karaoke: false,
            vibrato: false,
          });
          filterMode = false;
          embed.setDescription("❌ None");
        } else {
          await interaction.editReply({
            content: "⚠ There is already no effects on the queue.",
            ephemeral: true,
          });
        }
      }
      filterEmbed.react(`❌`);
      const filter = (reaction, user) => {
        [`❌`].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };
      const collector = filterEmbed.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (user.bot) return;
        else {
          reaction.users.remove(reaction.users.cache.get(user.id));
          if (reaction.emoji.name === `❌`) {
            if (filterMode === true) {
              queue.setFilters({
                "8D": false,
                bassboost_low: false,
                reverse: false,
                vaporwave: false,
                nightcore: false,
                earrape: false,
                fadein: false,
                karaoke: false,
                vibrato: false,
              });
              filterMode = false;
              success = true;
              embed.setDescription("❌ None");
              await interaction.editReply({
                embeds: [embed],
              });
            } else return;
          }
        }
      });
      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      failedEmbed
        .setTitle(`**Bot is busy**`)
        .setDescription(`Bot is busy in another voice channel.`)
        .setColor(0x256fc4)
        .setThumbnail(
          `https://cdn-icons-png.flaticon.com/512/1830/1830857.png`
        );
      await interaction.editReply({
        embeds: [failedEmbed],
      });
    }
    setTimeout(() => {
      if (success === true) {
        if (interaction.channel.id === musicChannelID) {
          filterEmbed.reactions
            .removeAll()
            .catch((error) =>
              console.error(
                chalk.red("Failed to clear reactions from song message."),
                error
              )
            );
        } else {
          interaction.deleteReply().catch(console.error);
        }
      } else {
        interaction.deleteReply().catch(console.error);
      }
    }, 10 * 60 * 1000);
  },
};
