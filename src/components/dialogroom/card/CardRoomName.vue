<template>
    <v-card id="card-roomname">
        <v-card-title>
            <span id="card-title">{{ $t('CardRoomName.title') }}</span>
        </v-card-title>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            :loading="loadRoom"
                            :disabled="loadRoom"
                            :type="streamerMode ? 'password' : 'text'"
                            id="inputRoomName"
                            v-model="roomInputValue"
                            maxlength="10"
                            autofocus
                            :error-messages="roomErrorMessage"
                            @keyup.enter="searchRoom(roomNameText)"
                        />
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <geo-btn variant="tonal" color="error" @click="$emit('cancel')">
                {{ $t('cancel') }}
            </geo-btn>
            <geo-btn
                variant="tonal"
                color="#43B581"
                @click="searchRoom(roomNameText)"
            >
                {{ $t('next') }}
            </geo-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/modernStores/game.store.js';
import CardRoomMixin from './mixins/CardRoomMixin';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '@/modernStores/home.store.js';

const roomNameText = ref('');

const homeStore = useHomeStore();
const streamerMode = computed(() => homeStore.streamerMode);

const gameStore = useGameStore();
const { roomErrorMessage, loadRoom, roomName } = storeToRefs(gameStore);

const roomInputValue = computed({
    get() {
        return roomNameText.value;
    },
    set(newValue) {
        roomNameText.value = newValue;
    },
});

function searchRoom(value) {
    gameStore.searchRoom(value);
}
</script>

<style lang="scss" scoped>
#card-title {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
}
</style>
