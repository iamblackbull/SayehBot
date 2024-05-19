module.exports = {
  name: "connection",
  isPlayerEvent: true,

  async execute(queue) {
    if (queue.metadata.channel?.id !== queue.connection.joinConfig.channelId)
      return queue.delete();

    queue.connection.on("stateChange", function (oldState, newState) {
      var oldNetworking = Reflect.get(oldState, "networking");
      var newNetworking = Reflect.get(newState, "networking");
      var networkStateChangeHandler = function (
        oldNetworkState,
        newNetworkState
      ) {
        var newUdp = Reflect.get(newNetworkState, "udp");

        clearInterval(
          newUdp === null || newUdp === void 0
            ? void 0
            : newUdp.keepAliveInterval
        );
      };

      oldNetworking === null || oldNetworking === void 0
        ? void 0
        : oldNetworking.off("stateChange", networkStateChangeHandler);

      newNetworking === null || newNetworking === void 0
        ? void 0
        : newNetworking.on("stateChange", networkStateChangeHandler);
    });
  },
};
