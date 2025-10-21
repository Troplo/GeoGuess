import { defineStore } from 'pinia';
import { nextTick, ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import {
    GameSocketClientEvent,
    GameSocketClientEvents,
} from '../geonext-server-types/types/socket/clientEvents.js';
import {
    GameSocketEventsServer,
    GameSocketServerEvent,
} from '../geonext-server-types/types/socket/serverEvents.js';
import { useGameStore } from './game.store.js';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useSessionStore } from './session.store.js';

type Callback<E extends GameSocketServerEvent> = (
    data: GameSocketServerEventMap[E]
) => void;

export const useGameSocketStore = defineStore('sockets.game', () => {
    const socket = ref<Socket | null>(null);
    const ready = ref(false);
    let _queuedEmits: {
        event: GameSocketClientEvent;
        data: any;
    }[] = [];

    async function init(token: string) {
        socket.value = io({
            auth: {
                token,
            },
            path: '/api/v1/socket/game',
            transports: ['websocket'],
            autoConnect: true,
        });
        socket.value.on('connect', () => {
            for (const emitter of _queuedEmits) {
                socket.value.emit(emitter.event, { data: emitter.data });
            }
            _queuedEmits = [];
        });
        await initHandlers();
    }

    async function initHandlers() {
        if (!socket.value) return;
        await gameHandlers();
        await playerHandlers();
        ready.value = true;
    }

    async function playerHandlers() {
        socket.value.on(
            GameSocketServerEvent.HELLO,
            ({ data }: GameSocketServerEvent[GameSocketServerEvent.HELLO]) => {
                console.log(data.resume);
                if (data.resume) {
                    const sessionStore = useSessionStore();
                    sessionStore.quickResume.resume = data.resume;
                    sessionStore.quickResume.dialogValue = true;
                }
            }
        );

        socket.value.on(
            GameSocketServerEvent.PLAYER_UPDATED,
            ({
                data,
            }: GameSocketServerEvent[GameSocketServerEvent.PLAYER_UPDATED]) => {
                const gameStore = useGameStore();
                if (!gameStore.players.length) return;
                const playerIndex = gameStore.players.findIndex(
                    (player) => player.playerId === data.playerId
                );
                if (playerIndex === -1) return;
                gameStore.room.players[playerIndex].player.name =
                    data.player.name;
            }
        );

        socket.value.on(
            GameSocketServerEvent.ROOM_PLAYER_JOINED,
            ({
                data,
            }: GameSocketServerEvent[GameSocketServerEvent.ROOM_PLAYER_JOINED]) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                const playerIndex = gameStore.players.findIndex(
                    (player) => player.playerId === data.playerId
                );
                if (playerIndex === -1) {
                    gameStore.room.players.push(data);
                }
            }
        );

        socket.value.on(
            GameSocketServerEvent.ROOM_PLAYER_SCORE_DETAILS_UPDATED,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.ROOM_PLAYER_SCORE_DETAILS_UPDATED]) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                const playerIndex = gameStore.players.findIndex(
                    (player) => player.playerId === data.playerId
                );
                if (playerIndex !== -1) {
                    const roundIndex = gameStore.players[
                        playerIndex
                    ].rounds.findIndex((rnd) => rnd.round === data.round.round);
                    if (roundIndex !== -1) {
                        gameStore.players[playerIndex].rounds[roundIndex] =
                            data;
                    } else {
                        gameStore.players[playerIndex].rounds.push(data.round);
                    }
                }
            }
        );

        socket.value.on(
            GameSocketServerEvent.GAME_NEW_ROUND,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.GAME_NEW_ROUND]) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                gameStore.room.currentRound = data.round;
            }
        );

        socket.value.on(
            GameSocketServerEvent.ROOM_PLAYER_DISCONNECTED,
            ({
                data,
            }: {
                data: GameSocketEventsServer[GameSocketServerEvent.ROOM_PLAYER_DISCONNECTED];
            }) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                const player = gameStore.players.find(
                    (plyr) => plyr.playerId === data.playerId
                );
                if (player) {
                    player.socketId = data.socketId;
                    player.connected = data.connected;
                    player.kickAt = data.kickAt;
                    player.rounds = data.rounds;
                } else {
                    // realistically this shouldn't happen
                    gameStore.room.players.push(data);
                }
            }
        );

        socket.value.on(
            GameSocketServerEvent.ROOM_PLAYER_RECONNECTED,
            ({
                data,
            }: {
                data: GameSocketEventsServer[GameSocketServerEvent.ROOM_PLAYER_RECONNECTED];
            }) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                const player = gameStore.players.find(
                    (plyr) => plyr.playerId === data.playerId
                );
                if (player) {
                    player.socketId = data.socketId;
                    player.connected = data.connected;
                    player.kickAt = data.kickAt;
                    player.rounds = data.rounds;
                } else {
                    // realistically this shouldn't happen
                    gameStore.room.players.push(data);
                }
            }
        );

        socket.value.on(
            GameSocketServerEvent.ROOM_PLAYER_LEFT,
            ({
                data,
            }: {
                data: GameSocketEventsServer[GameSocketServerEvent.ROOM_PLAYER_DISCONNECTED];
            }) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                const player = gameStore.players.find(
                    (plyr) => plyr.playerId === data.playerId
                );
                if (player) {
                    gameStore.room.players = gameStore.players.filter(
                        (plyr) => plyr.playerId !== plyr.playerId
                    );
                }
            }
        );
    }

    const router = useRouter();
    const legacyState = useStore();

    async function gameHandlers() {
        socket.value.on(
            GameSocketServerEvent.CREATE_ROOM_RESPONSE,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.CREATE_ROOM_RESPONSE]) => {
                const gameStore = useGameStore();
                gameStore.onRoomConnect(data);
            }
        );

        socket.value.on(
            GameSocketServerEvent.GAME_STARTED,
            ({
                data,
            }: {
                data: GameSocketEventsServer[GameSocketServerEvent.GAME_STARTED];
            }) => {
                const gameStore = useGameStore();
                gameStore.room.config = data.config;
                // TODO: hack, if someone clicks on the reconnect game button while in game, it won't do anything
                // router.replace('/').then(() => {
                router.push({
                    name: 'with-friends',
                    query: {
                        t: Date.now(),
                    },
                });
                // });

                gameStore.closeDialogRoom();
                const sessionStore = useSessionStore();
                sessionStore.quickResume.dialogValue = false;
            }
        );
    }

    function emit<E extends GameSocketClientEvent>(
        event: E,
        data: GameSocketClientEvents[E]
    ) {
        if (!socket.value) {
            _queuedEmits.push({
                event,
                data,
            });

            return;
        }
        socket.value.emit(event, { data });
    }

    function on<E extends GameSocketServerEvent>(event: E, cb: Callback<E>) {
        const listener = (payload: { data: GameSocketEventsServer[E] }) => {
            cb(payload.data);
        };
        socket.value.on(event, listener);
        return () => socket.value.off(event, listener);
    }

    function off<E extends GameSocketServerEvent>(event: E, cb: Callback<E>) {
        const listener = (payload: { data: GameSocketEventsServer[E] }) => {
            cb(payload.data);
        };
        socket.value.off(event, listener);
    }

    return {
        init,
        ready,
        emit,
        on,
        off,
        // should not be access directly. Available for debug tools
        _socket: socket,
    };
});
