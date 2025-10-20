import { defineStore } from 'pinia';
import { ref } from 'vue';
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

export const useGameSocketStore = defineStore('sockets.game', () => {
    let socket: Socket | null = null;
    const ready = ref(false);
    let _queuedEmits: {
        event: GameSocketClientEvent;
        data: any;
    }[] = [];

    async function init(token: string) {
        socket = io({
            auth: {
                token,
            },
            path: '/api/v1/socket/game',
            transports: ['websocket'],
        });
        socket.on('connect', () => {
            for (const emitter of _queuedEmits) {
                socket.emit(emitter.event, { data: emitter.data });
            }
            _queuedEmits = [];
        });
        await initHandlers();
    }

    async function initHandlers() {
        if (!socket) return;
        await gameHandlers();
        await playerHandlers();
        ready.value = true;
    }

    async function playerHandlers() {
        socket.on(
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

        socket.on(
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

        socket.on(
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

        socket.on(
            GameSocketServerEvent.GAME_NEW_ROUND,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.GAME_NEW_ROUND]) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                gameStore.room.currentRound = data.round;
            }
        );
    }

    const router = useRouter();
    const legacyState = useStore();

    async function gameHandlers() {
        socket.on(
            GameSocketServerEvent.CREATE_ROOM_RESPONSE,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.CREATE_ROOM_RESPONSE]) => {
                const gameStore = useGameStore();
                gameStore.onRoomConnect(data);
            }
        );

        socket.on(
            GameSocketServerEvent.GAME_STARTED,
            ({
                data,
            }: GameSocketEventsServer[GameSocketServerEvent.GAME_STARTED]) => {
                const gameStore = useGameStore();
                if (!gameStore.room) return;
                router.push({
                    name: 'with-friends',
                    query: {
                        roomName: btoa(gameStore.room.name),
                    },
                });

                gameStore.closeDialogRoom();
            }
        );
    }

    function emit<E extends GameSocketClientEvent>(
        event: E,
        data: GameSocketClientEvents[E]
    ) {
        if (!socket) {
            _queuedEmits.push({
                event,
                data,
            });

            return;
        }
        socket.emit(event, { data });
    }

    function on<E extends GameSocketServerEvent>(event: E, cb: Callback<E>) {
        const listener = (payload: { data: GameSocketEventsServer[E] }) => {
            cb(payload.data);
        };
        socket.on(event, listener);
        return () => socket.off(event, listener);
    }

    function off<E extends GameSocketServerEvent>(event: E, cb: Callback<E>) {
        const listener = (payload: { data: GameSocketEventsServer[E] }) => {
            cb(payload.data);
        };
        socket.off(event, listener);
    }

    return {
        init,
        ready,
        emit,
        on,
        off,
    };
});
