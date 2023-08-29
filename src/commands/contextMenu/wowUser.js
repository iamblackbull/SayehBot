const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const wow = require("../../schemas/wow-schema");
const { mongoose } = require("mongoose");
const noderiowrapper = require("noderiowrapper");
const RIO = new noderiowrapper();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("get wow stats")
    .setType(ApplicationCommandType.User),
  async execute(interaction, client) {
    const wowEmbed = await interaction.deferReply({
      fetchReply: true,
    });

    let success = false;
    let failedEmbed = new EmbedBuilder().setColor(0xffea00);

    if (mongoose.connection.readyState !== 1) {
      failedEmbed
        .setTitle(`**Connection Timed out!**`)
        .setDescription(
          `Connection to database has been timed out. please try again later.`
        )
        .setThumbnail(
          `https://cdn.iconscout.com/icon/premium/png-256-thumb/error-in-internet-959268.png`
        );
      interaction.editReply({
        embeds: [failedEmbed],
      });
    } else {
      let wowList = await wow.findOne({
        User: interaction.targetUser.id,
      });
      if (!wowList) {
        failedEmbed
          .setTitle(`**Action Failed**`)
          .setDescription(
            `${interaction.targetUser} doesn't have any WOW Character saved in the database.`
          )
          .setThumbnail(
            `https://assets.stickpng.com/images/5a81af7d9123fa7bcc9b0793.png`
          );
        interaction.editReply({
          embeds: [failedEmbed],
        });
      } else {
        const character = wowList.WowCharacter;
        const realm = wowList.WowRealm;
        const region = wowList.WowRegion;
        RIO.Character.gear = true;
        RIO.Character.guild = true;
        RIO.Character.mythic_plus_ranks = true;
        RIO.Character.mythic_plus_recent_runs = true;
        RIO.Character.mythic_plus_best_runs = true;
        RIO.Character.raid_progression = true;
        RIO.Character.mythic_plus_scores_by_season =
          RIO.Character._mythic_plus_scores_by_season_current;

        RIO.Character.getProfile(`${region}`, `${realm}`, `${character}`)
          .then((result) => {
            let recentRun;
            switch (result.mythic_plus_recent_runs[0].num_keystone_upgrades) {
              case 1:
                recentRun = `+`;
                break;
              case 2:
                recentRun = `++`;
                break;
              case 3:
                recentRun = `+++`;
                break;
              case 0:
                recentRun = ``;
                break;
              case -1:
                recentRun = `-`;
                break;
            }

            let bestRun;
            switch (result.mythic_plus_best_runs[0].num_keystone_upgrades) {
              case 1:
                bestRun = `+`;
                break;
              case 2:
                bestRun = `++`;
                break;
              case 3:
                bestRun = `+++`;
                break;
              case 0:
                bestRun = ``;
                break;
              case -1:
                bestRun = `-`;
                break;
            }

            const page1 = [
              {
                name: `Class`,
                value: `${result.class}-${result.active_spec_name}`,
                inline: true,
              },
              {
                name: `Faction`,
                value: `${result.faction}`,
                inline: true,
              },
              {
                name: `iLVL`,
                value: `${result.gear.item_level_equipped}`,
                inline: true,
              },
              {
                name: `Achievement Points`,
                value: `${result.achievement_points}`,
                inline: true,
              },
              {
                name: `M+ Rating`,
                value: `${parseInt(
                  result.mythic_plus_scores_by_season[0].scores.all
                )}`,
                inline: true,
              },
              {
                name: `Raid Progress`,
                value: `${
                  result.raid_progression[`aberrus-the-shadowed-crucible`]
                    .summary
                }`,
                inline: true,
              },
              {
                name: `Realm Class Rank`,
                value: `${result.mythic_plus_ranks.class.realm}`,
                inline: true,
              },
              {
                name: `M+ Recent Run`,
                value: `${result.mythic_plus_recent_runs[0].short_name} ${result.mythic_plus_recent_runs[0].mythic_level}${recentRun}`,
                inline: true,
              },
              {
                name: `M+ Best Run`,
                value: `${result.mythic_plus_best_runs[0].short_name} ${result.mythic_plus_best_runs[0].mythic_level}${bestRun}`,
                inline: true,
              },
            ];

            let embed = new EmbedBuilder()
              .setTitle(`**${result.name}-${result.realm}**`)
              .setURL(`${result.profile_url}`)
              .setThumbnail(`${result.thumbnail_url}`)
              .addFields(page1)
              .setColor(0xa89d32)
              .setFooter({
                iconURL: `https://i.pinimg.com/originals/cf/f4/a5/cff4a59d9390e8f836581e55828fb9ca.png`,
                text: `World of Warcraft`,
              });

            wowEmbed.react(`⬅`);
            wowEmbed.react(`➡`);
            const filter = (reaction, user) => {
              [`⬅`, `➡`].includes(reaction.emoji.name) &&
                user.id === interaction.user.id;
            };
            const collector = wowEmbed.createReactionCollector(filter);
            collector.on("collect", async (reaction, user) => {
              if (user.bot) return;

              reaction.users.remove(reaction.users.cache.get(user.id));

              if (reaction.emoji.name === `➡`) {
                const gearItems = [
                  { name: "Head", slot: "head" },
                  { name: "Neck", slot: "neck" },
                  { name: "Shoulder", slot: "shoulder" },
                  { name: "Back", slot: "back" },
                  { name: "Chest", slot: "chest" },
                  { name: "Waist", slot: "waist" },
                  { name: "Wrist", slot: "wrist" },
                  { name: "Hands", slot: "hands" },
                  { name: "Legs", slot: "legs" },
                  { name: "Feet", slot: "feet" },
                  { name: "Finger 1", slot: "finger1" },
                  { name: "Finger 2", slot: "finger2" },
                  { name: "Trinket 1", slot: "trinket1" },
                  { name: "Trinket 2", slot: "trinket2" },
                  { name: "Main Hand", slot: "mainhand" },
                  { name: "Off Hand", slot: "offhand" },
                ];

                gearItems.forEach((item) => {
                  const itemLevel =
                    result.gear.items[item.slot]?.item_level.toString() ||
                    "Empty";
                  embed.setFields({
                    name: item.name,
                    value: itemLevel,
                    inline: true,
                  });
                });

                await interaction.editReply({
                  embeds: [embed],
                });
              } else {
                embed.setFields(page1);

                await interaction.editReply({
                  embeds: [embed],
                });
              }
            });

            const recentButton = new ButtonBuilder()
              .setLabel(`M+ Recent Run`)
              .setURL(`${result.mythic_plus_recent_runs[0].url}`)
              .setStyle(ButtonStyle.Link);
            const bestButton = new ButtonBuilder()
              .setLabel(`M+ Best Run`)
              .setURL(`${result.mythic_plus_best_runs[0].url}`)
              .setStyle(ButtonStyle.Link);

            interaction.editReply({
              embeds: [embed],
              components: [
                new ActionRowBuilder()
                  .addComponents(recentButton)
                  .addComponents(bestButton),
              ],
            });

            success = true;
          })
          .catch((e) => {
            failedEmbed
              .setTitle(`**No Result**`)
              .setDescription(
                `Character might not be max level nor has played Dragonflight Season 2.`
              )
              .setThumbnail(
                `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
              );

            interaction.editReply({
              embeds: [failedEmbed],
            });
          });
      }
    }
    
    const timeoutDuration = success ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const timeoutLog = success
      ? "Failed to delete WOW context menu interaction."
      : "Failed to delete unsuccessfull WOW context menu interaction.";
    setTimeout(() => {
      interaction.deleteReply().catch((e) => {
        console.log(timeoutLog);
      });
    }, timeoutDuration);
  },
};
