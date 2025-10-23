import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
    Room,
    RoomConfig,
} from '../geonext-server-types/classes/rooms/Room.js';
import { useGameSocketStore } from './socket.store.js';
import { GameSocketClientEvent } from '../geonext-server-types/types/socket/clientEvents.js';
import { useSessionStore } from './session.store.js';
import {
    RoomPlayer,
    RoomPlayerRound,
} from '../geonext-server-types/classes/rooms/RoomPlayer.js';
import { useRouter } from 'vue-router';
import { useHomeStore } from './home.store.js';
import bbox from '@turf/bbox';

export const useGameStore = defineStore('game', () => {
    const isOpenDialogRoom = ref(false);
    const loadRoom = ref(false);
    const currentComponent = ref<
        'roomName' | 'playerName' | 'settingsMap' | 'settings'
    >('settingsMap');
    const singlePlayer = ref(true);

    // ROOM
    const room = ref<Room | null>(null);
    const roomName = ref('');
    const roomErrorMessage = ref('');

    // For legacy components
    const playerNumber = computed(() => {
        if (!room.value) return 0;
        if (currentRoomOwned.value) return 1;
        const sessionStore = useSessionStore();
        const index = players.value.findIndex(
            (plyr) => plyr.player.id === sessionStore.currentSession.playerId
        );
        if (index === -1) return 2;
        // Prevent the non-host accidentally being player 1
        return index + 2;
    });

    const gameSettings = computed({
        get: () => {
            if (!room.value) return new RoomConfig();
            return room.value.config;
        },
        set: (val) => {
            if (!room.value) {
                room.value = {
                    config: val,
                    players: [],
                    rounds: [],
                };
            } else {
                room.value.config = {
                    ...room.value.config,
                    ...val,
                };
            }
        },
    });

    const players = computed<RoomPlayer[]>(() => {
        if (!room.value?.players?.length) return [];
        return room.value.players;
    });

    const name = ref(
        localStorage.getItem('playerName')?.slice(0, 20) ||
            'CardRoomPlayerName.anonymousPlayerName'
    );
    const invalidName = ref(false);

    // FUNCTIONS
    function setError(error: string) {
        roomErrorMessage.value = error;
    }
    function setRoomName(name: string) {
        roomName.value = name;
    }
    function setRoom(_room: Room) {
        room.value = _room;
        if (currentRoomOwned.value && currentComponent.value === 'roomName') {
            currentComponent.value = 'settingsMap';
        } else {
            currentComponent.value = 'playerName';
        }

        if (!room.value.started) {
            singlePlayer.value = false;
            isOpenDialogRoom.value = true;
        }
    }

    async function searchRoom(name: string) {
        if (!name) {
            setError('DialogRoom.invalidRoomName');
        } else {
            roomName.value = name;
        }

        try {
            // const { data } = await geonextAxios.post('/rooms/joinOrCreate', {
            //     name,
            // });
            const socketStore = useGameSocketStore();
            socketStore.emit(GameSocketClientEvent.CREATE_ROOM, {
                name,
            });
        } catch (e) {
            console.error(e);
            setError('DialogRoom.invalidRoomName');
        }
    }

    async function onRoomConnect(room: Room) {
        setRoom(room);
    }

    function closeDialogRoom() {
        isOpenDialogRoom.value = false;
        // Handle disconnection
    }

    function openDialogRoom(isSinglePlayer = true) {
        isOpenDialogRoom.value = true;
        singlePlayer.value = isSinglePlayer;
        currentComponent.value = isSinglePlayer ? 'settingsMap' : 'roomName';
    }

    const currentRoomOwned = computed(() => {
        if (!room.value) return false;
        const sessionStore = useSessionStore();
        if (room.value.ownerPlayerId === sessionStore.currentSession.playerId)
            return true;
        return false;
    });

    const router = useRouter();

    async function saveSettings() {
        const socketStore = useGameSocketStore();
        const homeStore = useHomeStore();
        if (homeStore.map?.geojson) {
            room.value.config.bboxObj = bbox(homeStore.map.geojson);
            room.value.config.geoJson = homeStore.map.geojson;
        }
        socketStore.emit(GameSocketClientEvent.ROOM_UPDATE_CONFIG, {
            config: room.value.config,
            roomName: room.value.name,
        });
        if (singlePlayer.value) {
            router.push({
                name: 'street-view',
                params: {
                    modeSelected: room.value.config.modeSelected,
                    time: room.value.config.timeLimitation,
                    difficulty: room.value.config.difficulty,
                    roundsPredefined: room.value.config.nbRoundSelected,
                },
            });

            closeDialogRoom();
        } else {
            currentComponent.value = 'playerName';
        }
    }

    watch(
        () => name.value,
        (newName) => {
            const socketStore = useGameSocketStore();
            socketStore.emit(GameSocketClientEvent.USER_UPDATE_NAME, {
                name: newName,
            });
            localStorage.setItem('playerName', newName);
        }
    );

    function setName(val: string) {
        name.value = val;
    }

    async function startGame() {
        const socketStore = useGameSocketStore();

        socketStore.emit(GameSocketClientEvent.GAME_START, {
            config: room.value.config,
            roomName: room.value.name,
        });
    }

    async function commitGuess({
        longitude,
        latitude,
        distance,
        points,
        timePassed,
    }: {
        longitude: number;
        latitude: number;
        distance: number;
        points: number;
        timePassed: number;
    }) {
        if (!room.value) return;
        const socketStore = useGameSocketStore();
        socketStore.emit(GameSocketClientEvent.GAME_COMMIT_GUESS, {
            longitude,
            latitude,
            distance,
            points,
            timePassed,
            round: room.value.currentRound,
        });
    }

    const currentRoomPlayer = computed<RoomPlayer | null>(() => {
        const sessionStore = useSessionStore();
        const player = players.value.find(
            (plyr) => plyr.player.id === sessionStore.currentSession.playerId
        );
        return player;
    });

    const currentRoomRound = computed<RoomPlayerRound | null>(() => {
        const roomPlayer = currentRoomPlayer.value;
        if (!roomPlayer) return null;
        console.log(roomPlayer);
        const round = roomPlayer.rounds.find(
            (rnd) => rnd.round === room.value.currentRound
        );
        return round;
    });

    const currentDistanceScore = computed<number>(() => {
        const roomPlayer = currentRoomPlayer.value;
        if (!roomPlayer) return 0;
        return roomPlayer.rounds.reduce(
            (sum, round) => sum + round.distance,
            0
        );
    });

    const currentPointsScore = computed<number>(() => {
        const roomPlayer = currentRoomPlayer.value;
        if (!roomPlayer) return 0;
        return roomPlayer.rounds.reduce((sum, round) => sum + round.points, 0);
    });

    const ranks = computed<
        {
            id: string;
            name: string;
            totalPoints: number;
            totalScore: number;
            rank: number;
        }[]
    >(function () {
        if (!room.value || !room.value.players) return {};

        const scores = room.value.players.map(function (player) {
            const totalPoints = player.rounds.reduce(function (sum, round) {
                return sum + round.points;
            }, 0);
            const totalScore = player.rounds.reduce(function (sum, round) {
                return sum + round.distance;
            }, 0);
            return {
                id: player.id,
                totalPoints: totalPoints,
                totalScore: totalScore,
                name: player.player.name,
                rank: 0,
            };
        });

        scores.sort(function (a, b) {
            return b.totalPoints - a.totalPoints;
        });

        for (const i in scores) {
            scores[i].rank = i + 1;
        }

        return scores;
    });

    function leaveRoom() {
        closeDialogRoom();
        if (!singlePlayer.value && room.value) {
            const socketStore = useGameSocketStore();
            socketStore.emit(GameSocketClientEvent.ROOM_LEAVE, {
                roomName: room.value.name,
            });
            room.value = null;
        }
    }

    return {
        isOpenDialogRoom,
        loadRoom,
        currentComponent,
        singlePlayer,
        room,
        roomName,
        roomErrorMessage,
        playerNumber,
        gameSettings,
        players,
        name,
        invalidName,
        // FUNCTIONS
        searchRoom,
        closeDialogRoom,
        openDialogRoom,
        onRoomConnect,
        saveSettings,
        startGame,
        commitGuess,
        setName,
        leaveRoom,
        // COMPUTED
        currentRoomOwned,
        currentRoomPlayer,
        currentRoomRound,
        currentDistanceScore,
        currentPointsScore,
        ranks,
    };
});
