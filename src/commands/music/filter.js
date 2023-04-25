const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { AudioFilters } = require("discord-player");
const { musicChannelID } = process.env;
let filterMode = false;

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
            name: "8D",
            value: "8d",
          },
          {
            name: "Bassboost",
            value: "bassboost",
          },
          {
            name: "Vaporwave",
            value: "vaporwave",
          },
          {
            name: "Nightcore",
            value: "nightcore",
          },
          {
            name: "Reverse",
            value: "reverse",
          },
          {
            name: "Fade-In",
            value: "fadein",
          },
          {
            name: "Karaoke",
            value: "karaoke",
          },
          {
            name: "Vibrato",
            value: "vibrato",
          },
          {
            name: "Earrape",
            value: "earrape",
          },
          {
            name: "Remove",
            value: "remove",
          }
        );
    }),
  async execute(interaction, client) {
    const filterEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
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
        embed
          .setThumbnail(
            `https://res.cloudinary.com/mtree/image/upload/w_800,q_auto:eco,f_auto,dpr_auto/Braun-EN-US/1XGViwIsU8OuVsaIzd6zr8/77364d3f21dd75661831570058363290/pdp-icon-mpg-shaver-8d-flex-head-silver.png`
          )
          .setDescription("**8D** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "bassboost") {
        queue.setFilters({ bassboost_low: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://dl.hiapphere.com/data/icon/201411/HiAppHere_com_com.djit.bassboostforandroidfree.png`
          )
          .setDescription("**Bassboost** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "reverse") {
        queue.setFilters({ reverse: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/5869/5869821.png`
          )
          .setDescription("**Reverse** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "vaporwave") {
        queue.setFilters({ vaporwave: true });
        filterMode = true;
        embed
          .setThumbnail(`https://www.freeiconspng.com/img/43645`)
          .setDescription("**Vaporwave** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "nightcore") {
        queue.setFilters({ nightcore: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://image.apktoy.com/img/96/com.smp.musicspeed/icon.png`
          )
          .setDescription("**Nightcore** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "fadein") {
        queue.setFilters({ fadein: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/PT2019.png/800px-PT2019.png`
          )
          .setDescription("**Fade-In** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "karaoke") {
        queue.setFilters({ karaoke: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://cdn-icons-png.flaticon.com/512/1651/1651780.png`
          )
          .setDescription("**Karaoke** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "vibrato") {
        queue.setFilters({ vibrato: true });
        filterMode = true;
        embed
          .setThumbnail(
            `https://f-droid.org/repo/icons-640/io.gitlab.danielrparks.vibrato.3.png`
          )
          .setDescription("**Vibrato** filter has been added to the queue.");
      } else if (interaction.options.get("effect").value === "earrape") {
        queue.setFilters({ earrape: true });
        filterMode = true;
        embed
          .setThumbnail(`https://m.media-amazon.com/images/I/41P7AJjvdxL.png`)
          .setDescription("**Earrape** filter has been added to the queue.");
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
          embed
            .setThumbnail(
              `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ec0429cf-1471-466c-b958-f3b1faa7896b/d5z70lm-6957c824-d709-4562-ad56-966f5d234ed8.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2VjMDQyOWNmLTE0NzEtNDY2Yy1iOTU4LWYzYjFmYWE3ODk2YlwvZDV6NzBsbS02OTU3YzgyNC1kNzA5LTQ1NjItYWQ1Ni05NjZmNWQyMzRlZDgucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.Jc35y_HhdezDe5zo7RbWrKb685SrzGxDNYlBdAXtR0Q`
            )
            .setDescription("Effects have been removed from the queue.");
          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          failedEmbed
            .setTitle(`**Action Failed**`)
            .setDescription(`There are already no effects on the queue.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
            );
          await interaction.editReply({
            embeds: [failedEmbed],
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
              embed
                .setThumbnail(
                  `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ec0429cf-1471-466c-b958-f3b1faa7896b/d5z70lm-6957c824-d709-4562-ad56-966f5d234ed8.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2VjMDQyOWNmLTE0NzEtNDY2Yy1iOTU4LWYzYjFmYWE3ODk2YlwvZDV6NzBsbS02OTU3YzgyNC1kNzA5LTQ1NjItYWQ1Ni05NjZmNWQyMzRlZDgucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.Jc35y_HhdezDe5zo7RbWrKb685SrzGxDNYlBdAXtR0Q`
                )
                .setDescription("Effects have been removed from the queue.");
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
          interaction.deleteReply().catch((e) => {
            console.log(`Failed to delete Filter interaction.`);
          });
        }
      } else {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete unsuccessfull Filter interaction.`);
        });
      }
    }, 10 * 60 * 1000);
  },
};
