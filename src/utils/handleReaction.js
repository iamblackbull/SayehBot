const reactions = ["⬅", "➡", "🔀", "🔁"];
const numberReactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const voteReaction = "⏭";

function createReactionCollector(interaction, reply, emojis, timer) {
  emojis.forEach((emoji) => reply.react(emoji));

  const filter = (reaction, user) => {
    emojis.includes(reaction.emoji.name) &&
      user.voice?.channel?.id === interaction.member.voice.channel.id;
  };

  let collectorFilter = { filter };
  if (timer) {
    collectorFilter = { filter, time: timer };
  }

  const collector = reply.createReactionCollector(collectorFilter);

  return collector;
}

const queueReact = (interaction, reply) =>
  createReactionCollector(interaction, reply, reactions, false);

const searchReact = (interaction, reply, isLink) => {
  if (isLink) {
    createReactionCollector(interaction, reply, numberReactions[0], false);
  } else {
    createReactionCollector(interaction, reply, numberReactions, false);
  }
};

const pageReact = (interaction, reply) =>
  createReactionCollector(
    interaction,
    reply,
    [reactions[0], reactions[1]],
    false
  );

const shuffleReact = (interaction, reply) =>
  createReactionCollector(interaction, reply, [reactions[2]], false);

const repeatReact = (interaction, reply) =>
  createReactionCollector(interaction, reply, [reactions[3]], false);

const voteReact = (interaction, reply, timer) =>
  createReactionCollector(interaction, reply, [voteReaction], timer);

module.exports = {
  queueReact,
  searchReact,
  pageReact,
  shuffleReact,
  repeatReact,
  voteReact,
};
