const reactions = ["⬅", "➡", "🔀", "🔁"];
const numberReactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const voteReaction = "⏭";

function createCollector(interaction, reply, emojis, timer) {
  emojis.forEach((emoji) => reply.react(emoji));

  const filter = (reaction, user) => {
    return (
      emojis.includes(reaction.emoji.name) && user.id === interaction.user.id
    );
  };

  let collectorFilter = { filter };
  if (timer) {
    collectorFilter = { filter, time: timer };
  }

  const collector = reply.createReactionCollector(collectorFilter);

  return collector;
}

const queueReact = (interaction, reply) => {
  const collector = createCollector(interaction, reply, reactions, false);
  return collector;
};

const searchReact = (interaction, reply, isLink) => {
  let collector;
  if (isLink) {
    collector = createCollector(interaction, reply, numberReactions[0], false);
  } else {
    collector = createCollector(interaction, reply, numberReactions, false);
  }

  return collector;
};

const pageReact = (interaction, reply) => {
  const collector = createCollector(
    interaction,
    reply,
    [reactions[0], reactions[1]],
    false
  );
  return collector;
};

const shuffleReact = (interaction, reply) => {
  const collector = createCollector(interaction, reply, [reactions[2]], false);
  return collector;
};

const repeatReact = (interaction, reply) => {
  const collector = createCollector(interaction, reply, [reactions[3]], false);
  return collector;
};

const voteReact = (interaction, reply, timer) => {
  const collector = createCollector(interaction, reply, [voteReaction], timer);
  return collector;
};

module.exports = {
  queueReact,
  searchReact,
  pageReact,
  shuffleReact,
  repeatReact,
  voteReact,
};
