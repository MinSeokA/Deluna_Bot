const { EmbedBuilder } = require("discord.js");
const { DebugEvents } = require("./DebugEvents");
const { delay, formatMS_HHMMSS } = require("./Time");

const messagesMap = new Map();

function PlayerEvents(client) {
  /**
   * 플레이어 이벤트
   */
  client.music.on("playerCreate", (player) => {
    //logPlayer(client, player, "플레이어가 생성되었습니다 :: ");
  })
    .on("playerDestroy", (player, reason) => {
      //logPlayer(client, player, "플레이어가 제거되었습니다 :: ");
      sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`Deluna 플레이어가 종료하였습니다.`)
        ]
      });
    })
    .on("playerDisconnect", (player, voiceChannelId) => {
      //logPlayer(client, player, "플레이어가 음성 채널에서 연결이 끊겼습니다 :: ", voiceChannelId);
    })
    .on("playerMove", (player, oldVoiceChannelId, newVoiceChannelId) => {
      //logPlayer(client, player, "플레이어가 음성 채널에서 이동했습니다 :: ", oldVoiceChannelId, " :: 이동한 채널 ::", newVoiceChannelId);
    })
    .on("playerSocketClosed", (player, payload) => {
      //logPlayer(client, player, "플레이어 소켓이 음악에서 닫혔습니다 :: ", payload);
    })
    .on("playerUpdate", (player) => {
      // 필요한 경우 플레이어 데이터를 업데이트
    })
    .on("playerMuteChange", (player, selfMuted, serverMuted) => {
      //logPlayer(client, player, "INFO: 플레이어 음소거 변경", { selfMuted, serverMuted });
      if (serverMuted) {
        player.set("paused_of_servermute", true);
        player.pause();
      } else {
        if (player.get("paused_of_servermute") && player.paused) player.resume();
      }
    })
    .on("playerDeafChange", (player, selfDeaf, serverDeaf) => {
      //logPlayer(client, player, "INFO: 플레이어 청각 차단 변경");
    })
    .on("playerSuppressChange", (player, suppress) => {
      //logPlayer(client, player, "INFO: 플레이어 말하기 차단 변경");
    })
    .on("playerQueueEmptyStart", async (player, delayMs) => {
      //logPlayer(client, player, "INFO: 플레이어 대기열 비어 있음 시작");
      const msg = await sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setDescription(`플레이어 대기열이 비어 있으며, <t:${Math.round((Date.now() + delayMs) / 1000)}:R>에 연결이 끊어질 예정입니다.`)
        ]
      });
      if (msg) messagesMap.set(`${player.guildId}_queueempty`, msg);
    })
    .on("playerQueueEmptyEnd", (player) => {
      //logPlayer(client, player, "INFO: 플레이어 대기열 비어 있음 종료");
      const msg = messagesMap.get(`${player.guildId}_queueempty`);
      if (msg?.editable) {
        msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`플레이어가 대기열이 비어 있어 제거되었습니다.`)
          ]
        });
      }
    })
    .on("playerQueueEmptyCancel", (player) => {
      //logPlayer(client, player, "INFO: 플레이어 대기열 비어 있음 취소");
      const msg = messagesMap.get(`${player.guildId}_queueempty`);
      if (msg?.editable) {
        msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(`플레이어 대기열 비어 있음 타이머가 취소되었습니다. 새로운 트랙이 추가되었습니다.`)
          ]
        });
      }
    })
    .on("playerVoiceLeave", (player, userId) => {
      //logPlayer(client, player, "INFO: 플레이어 음성 채널 나감: ", userId);
    })
    .on("playerVoiceJoin", (player, userId) => {
      //logPlayer(client, player, "INFO: 플레이어 음성 채널 입장: ", userId);
    })
    .on("debug", (eventKey, eventData) => {
      if (eventKey === DebugEvents.NoAudioDebug && eventData.message === "Manager가 아직 초기화되지 않았습니다.") return;
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
   * 대기열/트랙 이벤트
   */
  client.music.on("trackStart", async (player, track) => {
    const avatarURL = track?.requester?.avatar || undefined;

    // logPlayer(client, player, "Started Playing :: ", track?.info?.title, "QUEUE:", player.queue.tracks.map(v => v.info.title));

    const embeds = [
      new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`🎶 ${track?.info?.title}`.substring(0, 256))
        .setThumbnail(track?.info?.artworkUrl || track?.pluginInfo?.artworkUrl || null)
        .setDescription(
          [
            `> - **업로더:** ${track?.info?.author}`,
            `> - **시간:** ${formatMS_HHMMSS(track?.info?.duration || 0)} | <t:${Math.floor((Date.now() + (track?.info?.duration || 0)) / 1000)}:R>에 종료`,

            `> - **플랫폼(출처):** ${track?.info?.sourceName}`,

            `> - **요청자:** <@${track?.requester?.id}>`,
            track?.pluginInfo?.clientData?.fromAutoplay ? `> *자동 재생에서 선택됨* ✅` : undefined
          ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        )
        .setFooter({
          text: `요청자: ${track?.requester?.username}`,
          iconURL: /^https?:\/\//.test(avatarURL || "") ? avatarURL : undefined,
        })
        .setTimestamp()
    ];
    if (track?.info?.uri && /^https?:\/\//.test(track?.info?.uri)) embeds[0].setURL(track.info.uri);

    sendPlayerMessage(client, player, { embeds });
  })
    .on("trackEnd", (player, track, payload) => {
      //logPlayer(client, player, "재생 종료 :: ", track?.info?.title);

      sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⏹ 재생 종료")
            .setDescription(`**${track?.info?.title}** 트랙이 종료되었습니다.`)
            .setTimestamp()
        ]
      });
    })
    .on("trackError", (player, track, payload) => {
      //logPlayer(client, player, "재생 중 오류 발생 :: ", track?.info?.title, " :: 오류 데이터 :: ", payload);
    })
    .on("trackStuck", (player, track, payload) => {
      //logPlayer(client, player, "재생 중 멈춤 발생 :: ", track?.info?.title, " :: 멈춤 데이터 :: ", payload);
    })
    .on("queueEnd", (player, track, payload) => {
      //logPlayer(client, player, "대기열에 더 이상 트랙이 없습니다. 마지막으로 재생한 트랙 :: ", track?.info?.title || track);
      sendPlayerMessage(client, player, {
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⏹ 대기열 종료")
            .setDescription(`대기열에 더 이상 트랙이 없습니다.`)
            .setTimestamp()
        ]
      });
    });
}

function logPlayer(client, player, ...messages) {
  console.group("플레이어 이벤트");
  console.log(`| 길드: ${player.guildId} | ${client.guilds.cache.get(player.guildId)?.name}`);
  console.log(`| 음성 채널: #${client.channels.cache.get(player.voiceChannelId)?.name || player.voiceChannelId}`);
  console.group("| 정보:");
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
