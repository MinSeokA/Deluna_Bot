const { EmbedBuilder } = require("discord.js");
const { DebugEvents } = require("./DebugEvents");
const { delay, formatMS_HHMMSS } = require("./Time");

const messagesMap = new Map();

function PlayerEvents(client) {
  /**
   * PLAYER EVENTS
   */
  client.music.on("playerCreate", (player) => {
    logPlayer(client, player, "Created a Player :: ");
  })
    .on("playerDestroy", (player, reason) => {
      logPlayer(client, player, "Player got Destroyed :: ");
      sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Player Destroyed")
            .setDescription(`Reason: ${reason || "Unknown"}`)
            .setTimestamp()
        ]
      });
    })
    .on("playerDisconnect", (player, voiceChannelId) => {
      logPlayer(client, player, "Player disconnected the Voice Channel :: ", voiceChannelId);
    })
    .on("playerMove", (player, oldVoiceChannelId, newVoiceChannelId) => {
      logPlayer(client, player, "Player moved from Voice Channel :: ", oldVoiceChannelId, " :: To ::", newVoiceChannelId);
    })
    .on("playerSocketClosed", (player, payload) => {
      logPlayer(client, player, "Player socket got closed from music :: ", payload);
    })
    .on("playerUpdate", (player) => {
      // Update player data if needed
    })
    .on("playerMuteChange", (player, selfMuted, serverMuted) => {
      logPlayer(client, player, "INFO: playerMuteChange", { selfMuted, serverMuted });
      if (serverMuted) {
        player.set("paused_of_servermute", true);
        player.pause();
      } else {
        if (player.get("paused_of_servermute") && player.paused) player.resume();
      }
    })
    .on("playerDeafChange", (player, selfDeaf, serverDeaf) => {
      logPlayer(client, player, "INFO: playerDeafChange");
    })
    .on("playerSuppressChange", (player, suppress) => {
      logPlayer(client, player, "INFO: playerSuppressChange");
    })
    .on("playerQueueEmptyStart", async (player, delayMs) => {
      logPlayer(client, player, "INFO: playerQueueEmptyStart");
      const msg = await sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setDescription(`Player queue got empty, will disconnect <t:${Math.round((Date.now() + delayMs) / 1000)}:R>`)
        ]
      });
      if (msg) messagesMap.set(`${player.guildId}_queueempty`, msg);
    })
    .on("playerQueueEmptyEnd", (player) => {
      logPlayer(client, player, "INFO: playerQueueEmptyEnd");
      const msg = messagesMap.get(`${player.guildId}_queueempty`);
      if (msg?.editable) {
        msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Player got destroyed because of queue Empty`)
          ]
        });
      }
    })
    .on("playerQueueEmptyCancel", (player) => {
      logPlayer(client, player, "INFO: playerQueueEmptyEnd");
      const msg = messagesMap.get(`${player.guildId}_queueempty`);
      if (msg?.editable) {
        msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Player queue empty timer got cancelled. Because i got enqueued a new track`)
          ]
        });
      }
    })
    .on("playerVoiceLeave", (player, userId) => {
      logPlayer(client, player, "INFO: playerVoiceLeave: ", userId);
    })
    .on("playerVoiceJoin", (player, userId) => {
      logPlayer(client, player, "INFO: playerVoiceJoin: ", userId);
    })
    .on("debug", (eventKey, eventData) => {
      if (eventKey === DebugEvents.NoAudioDebug && eventData.message === "Manager is not initated yet") return;
      if (eventKey === DebugEvents.PlayerUpdateSuccess && eventData.state === "log") return;
      return;
      console.group("music-Client-Debug:");
      console.log("-".repeat(20));
      console.debug(`[${eventKey}]`);
      console.debug(eventData);
      console.log("-".repeat(20));
      console.groupEnd();
    });

  /**
   * Queue/Track Events
   */
  client.music.on("trackStart", async (player, track) => {
    const avatarURL = track?.requester?.avatar || undefined;

    logPlayer(client, player, "Started Playing :: ", track?.info?.title, "QUEUE:", player.queue.tracks.map(v => v.info.title));

    const embeds = [
      new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`🎶 ${track?.info?.title}`.substring(0, 256))
        .setThumbnail(track?.info?.artworkUrl || track?.pluginInfo?.artworkUrl || null)
        .setDescription(
          [
            `> - **Author:** ${track?.info?.author}`,
            `> - **Duration:** ${formatMS_HHMMSS(track?.info?.duration || 0)} | Ends <t:${Math.floor((Date.now() + (track?.info?.duration || 0)) / 1000)}:R>`,
            `> - **Source:** ${track?.info?.sourceName}`,
            `> - **Requester:** <@${track?.requester?.id}>`,
            track?.pluginInfo?.clientData?.fromAutoplay ? `> *From Autoplay* ✅` : undefined
          ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        )
        .setFooter({
          text: `Requested by ${track?.requester?.username}`,
          iconURL: /^https?:\/\//.test(avatarURL || "") ? avatarURL : undefined,
        })
        .setTimestamp()
    ];
    if (track?.info?.uri && /^https?:\/\//.test(track?.info?.uri)) embeds[0].setURL(track.info.uri);

    sendPlayerMessage(client, player, { embeds });
  })
    .on("trackEnd", (player, track, payload) => {
      logPlayer(client, player, "Finished Playing :: ", track?.info?.title);
    })
    .on("trackError", (player, track, payload) => {
      logPlayer(client, player, "Errored while Playing :: ", track?.info?.title, " :: ERROR DATA :: ", payload);
    })
    .on("trackStuck", (player, track, payload) => {
      logPlayer(client, player, "Got Stuck while Playing :: ", track?.info?.title, " :: STUCKED DATA :: ", payload);
    })
    .on("queueEnd", (player, track, payload) => {
      logPlayer(client, player, "No more tracks in the queue, after playing :: ", track?.info?.title || track);
      sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Queue Ended")
            .setTimestamp()
        ]
      });
    });
}

function logPlayer(client, player, ...messages) {
  console.group("Player Event");
  console.log(`| Guild: ${player.guildId} | ${client.guilds.cache.get(player.guildId)?.name}`);
  console.log(`| Voice Channel: #${client.channels.cache.get(player.voiceChannelId)?.name || player.voiceChannelId}`);
  console.group("| Info:");
  console.log(...messages);
  console.groupEnd();
  console.groupEnd();
}

async function sendPlayerMessage(client, player, messageData) {
  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  return channel.send(messageData);
}

module.exports = { PlayerEvents };
