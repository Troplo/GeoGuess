<template>
    <v-dialog :persistent="true" v-model="value" max-width="700">
        <v-card>
            <v-toolbar>
                <v-toolbar-title>
                    {{
                        t(
                            showDisconnectTerminology
                                ? 'resumeDialog.titleDisconnected'
                                : 'resumeDialog.title'
                        )
                    }}
                </v-toolbar-title>
            </v-toolbar>
            <v-container>
                <v-card-text>
                    {{
                        t(
                            showDisconnectTerminology
                                ? 'resumeDialog.descriptionDisconnect'
                                : 'resumeDialog.description'
                        )
                    }}
                </v-card-text>
                <v-card-text>
                    {{
                        t('resumeDialog.room', {
                            room: resume?.room?.name,
                        })
                    }}
                    <Leaderboard
                        style="top: 15px"
                        :leaderboard-shown="true"
                        :current-round="resume?.room?.currentRound"
                        :players="resume?.room?.players"
                        :disable-styling="true"
                    ></Leaderboard>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="red" @click="doLeave()">
                        {{ t('resumeDialog.leave') }}
                    </v-btn>
                    <v-btn variant="tonal" color="primary" @click="doResume()">
                        {{
                            t(
                                showDisconnectTerminology
                                    ? 'resumeDialog.reconnect'
                                    : 'resumeDialog.resume'
                            )
                        }}
                    </v-btn>
                </v-card-actions>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { Room } from '@/geonext-server-types/classes/rooms/Room.js';
import { useI18n } from 'vue-i18n';
import Leaderboard from '@/components/game/Leaderboard.vue';
import { useGameSocketStore } from '@/modernStores/socket.store.js';
import { useGameStore } from '@/modernStores/game.store.js';
import { computed, ref, watch } from 'vue';
import { GameSocketClientEvent } from '@/geonext-server-types/types/socket/clientEvents.js';
import { useRoute } from 'vue-router';
import { useExperimentsStore } from '@/modernStores/experiments.store.js';

const value = defineModel<boolean>();
const loading = ref(false);

const props = defineProps<{
    resume: {
        room: Room;
        kickAt: string;
    };
}>();

const { t } = useI18n();

const gameSocketStore = useGameSocketStore();
const gameStore = useGameStore();
const experimentsStore = useExperimentsStore();

async function doLeave() {
    gameSocketStore.emit(GameSocketClientEvent.ROOM_LEAVE, {
        roomName: props.resume.room.name,
    });
    value.value = false;
}

let reconnectTimer: NodeJS.Timeout;

async function doResume() {
    if (loading.value) return; // prevent overlapping calls
    loading.value = true;

    await gameStore.searchRoom(props.resume.room.name);

    // If room is still not found, schedule next retry
    if (gameStore.roomName !== props.resume.room.name) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(doResume, 10_000);
    } else {
        loading.value = false;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }
}

watch(
    () => gameStore.roomName,
    (newVal) => {
        if (newVal === props.resume.room.name) {
            loading.value = false;
            value.value = false;

            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        }
    }
);

const route = useRoute();
const showDisconnectTerminology = computed(() => {
    return route.name === 'street-view' || route.name === 'with-friends';
});

watch(
    () => value.value,
    (newVal) => {
        if (
            newVal &&
            showDisconnectTerminology.value &&
            experimentsStore.experiments.GAME_AUTO_RECONNECT
        ) {
            doResume();
        } else {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        }
    }
);
</script>

<style scoped lang="scss"></style>
