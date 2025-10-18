import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
    Room,
    RoomConfig,
} from '../geonext-server-types/classes/rooms/Room.js';
import geonextAxios from '../plugins/geonextAxios.js';

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
    const playerNumber = ref(0);

    const gameSettings = computed(() => {
        if (!room.value) return new RoomConfig();
        return room.value.config;
    });

    const players = computed(() => {
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
    }

    async function searchRoom(name: string) {
        if (!name) {
            setError('DialogRoom.invalidRoomName');
        } else {
            roomName.value = name;
        }

        try {
            const { data } = await geonextAxios.post('/rooms/joinOrCreate', {
                name,
            });
            setRoom(data);
        } catch {
            setError('DialogRoom.invalidRoomName');
        }
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
    };
});
