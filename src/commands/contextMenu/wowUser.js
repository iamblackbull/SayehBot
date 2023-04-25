const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const wow = require("../../schemas/wow-schema");
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

    let failedEmbed = new EmbedBuilder();

    let wowList = await wow.findOne({
      User: interaction.targetUser.id,
    });
    if (!wowList) {
      failedEmbed
        .setTitle(`**Action Failed**`)
        .setDescription(
          `${interaction.targetUser} doesn't have any WOW Character saved in the database.`
        )
        .setColor(0xffea00)
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
          if (result.mythic_plus_recent_runs[0].num_keystone_upgrades === 1)
            recentRun = `+`;
          if (result.mythic_plus_recent_runs[0].num_keystone_upgrades === 2)
            recentRun = `++`;
          if (result.mythic_plus_recent_runs[0].num_keystone_upgrades === 3)
            recentRun = `+++`;
          if (result.mythic_plus_recent_runs[0].num_keystone_upgrades === 0)
            recentRun = ``;
          if (result.mythic_plus_recent_runs[0].num_keystone_upgrades === -1)
            recentRun = `-`;
          let bestRun;
          if (result.mythic_plus_best_runs[0].num_keystone_upgrades === 1)
            bestRun = `+`;
          if (result.mythic_plus_best_runs[0].num_keystone_upgrades === 2)
            bestRun = `++`;
          if (result.mythic_plus_best_runs[0].num_keystone_upgrades === 3)
            bestRun = `+++`;
          if (result.mythic_plus_best_runs[0].num_keystone_upgrades === 0)
            bestRun = ``;
          if (result.mythic_plus_best_runs[0].num_keystone_upgrades === -1)
            bestRun = `-`;
          let embed = new EmbedBuilder()
            .setTitle(`**${result.name}-${result.realm}**`)
            .setURL(`${result.profile_url}`)
            .setThumbnail(`${result.thumbnail_url}`)
            .addFields(
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
                  result.raid_progression[`vault-of-the-incarnates`].summary
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
              }
            )
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
            else {
              reaction.users.remove(reaction.users.cache.get(user.id));
              if (reaction.emoji.name === `➡`) {
                page = 2;
                embed.setFields();
                if (!result.gear.items.head) {
                  embed.addFields({
                    name: `Head`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Head`,
                    value: `${result.gear.items.head.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.neck) {
                  embed.addFields({
                    name: `Neck`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Neck`,
                    value: `${result.gear.items.neck.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.shoulder) {
                  embed.addFields({
                    name: `Shoulder`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Shoulder`,
                    value: `${result.gear.items.shoulder.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.back) {
                  embed.addFields({
                    name: `Back`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Back`,
                    value: `${result.gear.items.back.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.chest) {
                  embed.addFields({
                    name: `Chest`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Chest`,
                    value: `${result.gear.items.chest.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.waist) {
                  embed.addFields({
                    name: `Waist`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Waist`,
                    value: `${result.gear.items.waist.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.wrist) {
                  embed.addFields({
                    name: `Wrist`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Wrist`,
                    value: `${result.gear.items.wrist.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.hands) {
                  embed.addFields({
                    name: `Hands`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Hands`,
                    value: `${result.gear.items.hands.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.legs) {
                  embed.addFields({
                    name: `Legs`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Legs`,
                    value: `${result.gear.items.legs.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.feet) {
                  embed.addFields({
                    name: `Feet`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Feet`,
                    value: `${result.gear.items.feet.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.mainhand) {
                  embed.addFields({
                    name: `Finger 1`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Finger 1`,
                    value: `${result.gear.items.finger1.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.mainhand) {
                  embed.addFields({
                    name: `Finger 2`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Finger 2`,
                    value: `${result.gear.items.finger2.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.mainhand) {
                  embed.addFields({
                    name: `Trinket 1`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Trinket 1`,
                    value: `${result.gear.items.trinket1.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.mainhand) {
                  embed.addFields({
                    name: `Trinket 2`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Trinket 2`,
                    value: `${result.gear.items.trinket2.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.mainhand) {
                  embed.addFields({
                    name: `Main Hand`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Main Hand`,
                    value: `${result.gear.items.mainhand.item_level}`,
                    inline: true,
                  });
                }
                if (!result.gear.items.offhand) {
                  embed.addFields({
                    name: `Off Hand`,
                    value: `-`,
                    inline: true,
                  });
                } else {
                  embed.addFields({
                    name: `Off Hand`,
                    value: `${result.gear.items.offhand.item_level}`,
                    inline: true,
                  });
                }
                await interaction.editReply({
                  embeds: [embed],
                });
              } else {
                page = 1;
                embed.setFields(
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
                      result.raid_progression[`vault-of-the-incarnates`].summary
                    }`,
                    inline: true,
                  },
                  {
                    name: `Class Realm Rank`,
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
                  }
                );
                await interaction.editReply({
                  embeds: [embed],
                });
              }
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
        })
        .catch((e) => {
          failedEmbed
            .setTitle(`**No Result**`)
            .setDescription(`Character might not be max level.`)
            .setColor(0xffea00)
            .setThumbnail(
              `https://cdn-icons-png.flaticon.com/512/6134/6134065.png`
            );
          interaction.editReply({
            embeds: [failedEmbed],
          });
        });

      setTimeout(() => {
        interaction.deleteReply().catch((e) => {
          console.log(`Failed to delete WOW context menu.`);
        });
      }, 5 * 60 * 1000);
    }
  },
};
