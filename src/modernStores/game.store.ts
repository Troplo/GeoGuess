import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
    GameMode,
    Room,
    RoomConfig,
} from '../geonext-server-types/classes/rooms/Room.js';
import { useGameSocketStore } from './socket.store.js';
import { GameSocketClientEvent } from '../geonext-server-types/types/socket/clientEvents.js';
import { useSessionStore } from './session.store.js';
import { RoomPlayer } from '../geonext-server-types/classes/rooms/RoomPlayer.js';
import { useRouter } from 'vue-router';

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
        const index = room.value.players.findIndex(
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
            }
        },
    });

    const players = computed<RoomPlayer[]>(() => {
        if (!room.value) return [];
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
        } else if (currentComponent.value === 'roomName') {
            currentComponent.value = 'playerName';
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
            await socketStore.emit(GameSocketClientEvent.CREATE_ROOM, {
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

        socketStore.emit(GameSocketClientEvent.GAME_START, {});
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
        // COMPUTED
        currentRoomOwned,
    };
});
