<template>
    <v-alert
        id="leaderboard-alert"
        standard-easing
        width="400"
        color="background"
        class="mt-2 mr-2"
    >
        <div class="d-flex ga-2 align-center">
            <v-icon> mdi-scoreboard-outline </v-icon>
            <div>
                <p v-for="player in players" :key="player.playerId">
                    {{ player.name }} ({{ player.points }} points)
                    <v-chip
                        :color="player.guessed ? 'green' : undefined"
                        size="x-small"
                    >
                        {{ player.guessed ? 'Guessed' : 'Not Guessed' }}
                    </v-chip>
                </p>
            </div>
        </div>
    </v-alert>
</template>

<script setup lang="ts">
import { useGameStore } from '@/modernStores/game.store.js';
import { computed } from 'vue';

const gameStore = useGameStore();

const currentRound = computed(() => {
    return gameStore.room?.currentRound;
});
const players = computed(() => {
    if (!gameStore.players?.length) return [];
    return gameStore.players.map((player) => {
        const round = player.rounds.find(
            (rnd) => rnd.round === currentRound.value
        );
        return {
            guessed: round?.guessed ?? false,
            name: player.player.name,
            points: player.rounds.reduce((sum, round) => sum + round.points, 0),
        };
    });
});
</script>

<style scoped lang="scss">
#leaderboard-alert {
    opacity: 0.8;
    white-space: pre-line;
    float: right;
    pointer-events: none;
    position: absolute;
    right: 15px;
}
</style>
