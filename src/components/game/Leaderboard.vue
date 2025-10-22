<template>
    <v-alert
        :class="{ 'leaderboard-alert': !disableStyling }"
        standard-easing
        width="400"
        color="#212121"
        class="mt-2 mr-2"
    >
        <div class="d-flex ga-2 align-center">
            <v-icon> mdi-scoreboard-outline </v-icon>
            <div>
                <p
                    v-for="player in players"
                    :key="player.playerId"
                    class="ga-1 d-flex align-center my-1"
                >
                    {{ player.name }} ({{ player.points }} points)
                    <v-chip
                        color="gold"
                        v-if="ownerId === player.playerId"
                        size="x-small"
                    >
                        <v-icon>mdi-crown</v-icon>
                    </v-chip>
                    <v-chip
                        :color="player.guessed ? 'green' : undefined"
                        size="x-small"
                    >
                        {{ player.guessed ? 'Guessed' : 'Not Guessed' }}
                    </v-chip>
                    <v-chip
                        v-if="player.remainingTime !== 0"
                        color="red"
                        size="x-small"
                    >
                        <v-tooltip activator="parent" location="top">
                            {{
                                $t('Maps.leaderboard.disconnected', {
                                    player: player.name,
                                    time: formatTime(player.remainingTime),
                                })
                            }}
                        </v-tooltip>
                        <v-icon class="mr-1"> mdi-alert-circle </v-icon>
                        <template v-if="player.remainingTime > 0">
                            {{ formatTime(player.remainingTime) }}
                        </template>
                        <template v-else>
                            {{ $t('Maps.leaderboard.kicking') }}
                        </template>
                    </v-chip>
                </p>
            </div>
        </div>
    </v-alert>
</template>

<script setup lang="ts">
import { useGameStore } from '@/modernStores/game.store.js';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RoomPlayer } from '@/geonext-server-types/classes/rooms/RoomPlayer.js';

const gameStore = useGameStore();

const props = defineProps<{
    players: RoomPlayer[];
    currentRound: number | undefined | null;
    disableStyling?: boolean;
    ownerId?: string;
}>();

const now = ref(Date.now());

let interval: number;

onMounted(() => {
    interval = window.setInterval(() => {
        now.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});

const players = computed(() => {
    if (!props.players?.length) return [];

    const allGuessed = props.players.every(function (player) {
        const round = player.rounds.find(
            (rnd) => rnd.round === props.currentRound
        );
        return round?.guessed ?? false;
    });

    return props.players.map(function (player) {
        const round = player.rounds.find(
            (rnd) => rnd.round === props.currentRound
        );
        const remainingTime = player.kickAt
            ? Math.max(-1, Math.floor((player.kickAt - now.value) / 1000))
            : 0;

        return {
            guessed: round?.guessed ?? false,
            name: player.player.name,
            points: allGuessed
                ? player.rounds.reduce(function (sum, round) {
                      return sum + round.points;
                  }, 0)
                : player.rounds
                      .filter((rnd) => rnd.round !== props.currentRound)
                      .reduce(function (sum, round) {
                          return sum + round.points;
                      }, 0),
            connected: player.connected,
            remainingTime,
            playerId: player.playerId,
        };
    });
});

function formatTime(seconds: number) {
    if (seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
</script>

<style scoped lang="scss">
.leaderboard-alert {
    opacity: 0.8;
    white-space: pre-line;
    float: right;
    pointer-events: none;
    position: absolute;
    right: 15px;
}
</style>
