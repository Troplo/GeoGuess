<template>
    <v-card id="card-playername">
        <v-card-title>
            <span id="card-title">
                {{ $t('CardRoomPlayerName.title') }}
                <span :class="{ blur: streamerMode }">{{ roomName }}</span>
            </span>
        </v-card-title>

        <v-card-subtitle ref="roomUrl" class="pb-0">
            <span :class="{ blur: streamerMode }">{{ roomUrl }} </span>
            <v-icon size="small" @click="copy"> mdi-content-copy </v-icon>
        </v-card-subtitle>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            id="inputPlayerName"
                            :model-value="name"
                            @update:model-value="setPlayerName"
                            maxlength="20"
                            autofocus
                            :label="$t('CardRoomPlayerName.input')"
                            :error="invalidName"
                        />
                    </v-col>
                </v-row>

                <h3>{{ $tc('CardRoomPlayerName.players', players.length) }}</h3>
                <v-chip-group column>
                    <v-chip
                        v-for="roomPlayer in players"
                        :key="'player' + roomPlayer.player.id"
                        color="#424242"
                    >
                        <v-avatar
                            :color="
                                [
                                    '#E91B0C',
                                    '#5ccc00',
                                    '#e0ca00',
                                    '#FF1F69',
                                    '#00b8b8',
                                ][i % 5]
                            "
                            start
                        >
                        </v-avatar>
                        {{ roomPlayer.player.name }}
                    </v-chip>
                </v-chip-group>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <geo-btn variant="tonal" color="error" @click="cancel">
                {{ $t('cancel') }}
            </geo-btn>
            <geo-btn
                v-if="playerNumber === 1"
                id="btnStart"
                variant="tonal"
                color="#43B581"
                :disabled="players.length < 2 || !canNext"
                @click="startGame"
            >
                {{ $t('next') }}
            </geo-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useGameStore } from '@/modernStores/game.store.js';
import CardRoomMixin from './mixins/CardRoomMixin';

const gameStore = useGameStore();

const store = useStore();

const roomUrlRef = ref<HTMLElement | null>(null);

const playerNumber = computed(() => gameStore.playerNumber);
const roomName = computed(() => gameStore.roomName);
const players = computed(() => gameStore.players);
const name = computed(() => gameStore.name);
const invalidName = computed(() => gameStore.invalidName);

const streamerMode = computed(() => store.state.homeStore.streamerMode);

const roomUrl = computed(() => `${window.origin}/room/${roomName.value}`);

const canNext = computed(
    () => !players.value.some((player: string) => player === '')
);

function startGame() {
    gameStore.startGame();
}

function setPlayerName(playerName: string) {
    gameStore.name = playerName;
}

function copy() {
    if (roomUrlRef.value) {
        // Use the clipboard API for Vue 3 instead of this.$copyText
        navigator.clipboard.writeText(roomUrl.value).catch((err) => {
            console.error('Failed to copy: ', err);
        });
    }
}

CardRoomMixin;
</script>

<style scoped>
#card-title {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
}
h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-weight: 500;
}
</style>
