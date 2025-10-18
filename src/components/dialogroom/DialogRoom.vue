<template>
    <v-dialog
        v-model="isOpenDialogRoom"
        persistent
        :fullscreen="$viewport.width < 450"
        max-width="800"
        content-class="dialog-room"
    >
        <component
            :is="selectedComponent"
            :single-player="singlePlayer"
            :current-component="currentComponent"
            :room="room"
            :room-name="roomName"
            @cancel="cancel"
        />
    </v-dialog>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/modernStores/game.store.js';

import CardRoomName from '@/components/dialogroom/card/CardRoomName.vue';
import CardRoomSettings from '@/components/dialogroom/card/CardRoomSettings.vue';
import CardRoomPlayerName from '@/components/dialogroom/card/CardRoomPlayerName.vue';
import CardRoomMap from './card/CardRoomMap.vue';

// Initialize store
const gameStore = useGameStore();

// Extract reactive state as refs
const {
    isOpenDialogRoom,
    currentComponent,
    singlePlayer,
    loadingGeoJson,
    placeGeoJson,
    room,
    roomName,
} = storeToRefs(gameStore);

const selectedComponent = computed(() => {
    switch (currentComponent.value) {
        case 'roomName':
            return CardRoomName;
        case 'playerName':
            return CardRoomPlayerName;
        case 'settingsMap':
            return CardRoomMap;
        case 'settings':
        default:
            return CardRoomSettings;
    }
});

// Access route params
const route = useRoute();

// Lifecycle hook to check roomName on mount
onMounted(() => {
    if (route.params.roomName) {
        gameStore.searchRoom(route.params.roomName);
    }
});

// Methods
function cancel() {
    gameStore.closeDialogRoom();
}
</script>
