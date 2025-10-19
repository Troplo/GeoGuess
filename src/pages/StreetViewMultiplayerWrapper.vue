<template>
    <StreetView
        v-bind="{
            ...gameStore.room.config,
            multiplayer: true,
            playerNumber: gameStore.playerNumber,
            roomName: gameStore.room.name,
        }"
        v-if="gameStore.room"
    />
</template>

<script setup lang="ts">
import StreetView from '@/pages/StreetView.vue';
import { useGameStore } from '@/modernStores/game.store.js';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const gameStore = useGameStore();
const router = useRouter();
onMounted(() => {
    if (!gameStore.room) {
        return router.push({ name: 'home' });
    }
});
</script>

<style scoped lang="scss"></style>
