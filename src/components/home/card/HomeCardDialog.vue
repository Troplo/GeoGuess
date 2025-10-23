<template>
    <v-dialog
        v-model="visible"
        max-width="500"
        :fullscreen="$viewport.width < 450"
    >
        <template v-slot:activator="{ props }">
            <geo-btn variant="text" color="darkGreen" v-bind="props">
                {{ $t('Home.play') }}
            </geo-btn>
        </template>
        <v-card>
            <v-img
                class="text-white align-end"
                height="230px"
                gradient="rgba(0,0,0,0), rgba(0,0,0,0.8)"
                :src="data.imageSrc"
            >
                <v-card-title>{{ data.nameLocate }}</v-card-title>
            </v-img>
            <v-card-subtitle class="pt-3 pb-2 font-italic">
                {{ data.author }}
            </v-card-subtitle>
            <v-card-text class="text--primary map-dialog__description">
                {{ data.descriptionLocate }}
            </v-card-text>
            <v-card-actions>
                <geo-btn color="error" variant="text" @click="visible = false">
                    {{ $t('cancel') }}
                </geo-btn>

                <v-spacer />
                <geo-btn color="primary" @click="onClickSinglePlayer">
                    {{ $t('DialogRoom.singlePlayer') }}
                </geo-btn>

                <geo-btn color="secondary" @click="onClickMultiPlayer">
                    {{ $t('DialogRoom.withFriends') }}
                </geo-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '@/modernStores/game.store.js';
import { useHomeStore } from '@/modernStores/home.store.js';

const props = defineProps({
    data: Object,
    type: {
        type: String,
        validator: (v) => ['map', 'area'].includes(v),
    },
});

const visible = ref(false);

const gameStore = useGameStore();
const homeStore = useHomeStore();

function setMap() {
    console.log('setMap', props);
    if (props.type === 'area') {
        homeStore.loadGeoJsonFromUrl(props.data.data.urlArea);
        gameStore.saveSettings({ areaParams: props.data });
    } else {
        if (props.data.type === 'custom') {
            homeStore.setMap(props.data);
        } else {
            homeStore.loadMapData(props.data);
        }
    }
    visible.value = false;
}

function onClickSinglePlayer() {
    setMap();
    gameStore.openDialogRoom(true);
}

function onClickMultiPlayer() {
    setMap();
    gameStore.openDialogRoom(false);
}
</script>

<style scoped>
.map-dialog__description {
    max-height: 20vh;
    overflow-y: auto;
}
</style>
