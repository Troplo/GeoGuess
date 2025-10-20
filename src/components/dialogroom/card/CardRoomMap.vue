<template>
    <v-card id="card-map">
        <v-card-title>
            <span id="card-title"> {{ $t('CardRoomMap.title') }} </span>
        </v-card-title>

        <v-card-text>
            <v-row class="search-bar">
                <v-combobox
                    id="search-input"
                    v-model="place"
                    :items="items"
                    v-model:search="search"
                    :loading="isLoading"
                    autofocus
                    :placeholder="$t('Home.searchBar.enterCity')"
                    bg-color="secondary"
                    rounded
                    @update:model-value="loadPlaceGeoJSON"
                />
                <geo-btn
                    @click="loadPlaceGeoJSON(place)"
                    color="dark"
                    id="loadBtn"
                    :loading="loadingGeoJson"
                >
                    {{ $t('CardRoomMap.loadBtn') }}
                </geo-btn>
            </v-row>
            <GMapMap
                ref="mapRef"
                :center="{ lat: 10, lng: 10 }"
                :zoom="1"
                map-type-id="roadmap"
                style="width: 100%; height: 400px"
                :options="{
                    mapTypeControl: false,
                    fullscreenControl: false,
                    gestureHandling: 'greedy',
                    styles:
                        $vuetify.theme.global.name === 'dark'
                            ? $vuetify.theme.themes.dark.gmap
                            : $vuetify.theme.themes.light.gmap,
                }"
            />
            <v-row justify="space-around">
                <v-alert
                    v-if="!canPlayGeoJSON"
                    right
                    icon="mdi-alert"
                    color="warning"
                >
                    {{ $t('CardRoomMap.cantPlayGeoJson') }}
                </v-alert>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <geo-btn variant="plain" v-if="geoJson" @click="reset">{{
                $t('CardRoomMap.reset')
            }}</geo-btn>
            <v-spacer />
            <geo-btn variant="tonal" color="error" @click="cancel">
                {{ $t('cancel') }}
            </geo-btn>
            <geo-btn
                id="btnStart"
                variant="tonal"
                color="#43B581"
                @click="next"
                :disabled="loadingGeoJson || !canPlayGeoJSON"
            >
                {{ $t('next') }}
            </geo-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useGameStore } from '@/modernStores/game.store.js';
import CardRoomMixin from './mixins/CardRoomMixin';

// Pinia store for settings
const gameStore = useGameStore();

// Vuex store
const store = useStore();

// Refs / reactive state
const place = ref<string>('');
const entries = ref<any[]>([]);
const isLoading = ref<boolean>(false);
const search = ref<string>('');
const mapRef = ref(null);

// Computed properties
const geoJson = computed(() => store.getters.geoJson);
const loadingGeoJson = computed(() => store.state.homeStore.loadingGeoJson);

const items = computed(() =>
    entries.value.map((entry) => entry.properties.name)
);

const canPlayGeoJSON = computed(() => {
    return !(
        geoJson.value &&
        Array.isArray(geoJson.value.features) &&
        geoJson.value.features.length < 5 &&
        geoJson.value.features.every(
            (feature: any) => feature.geometry.type === 'Point'
        )
    );
});

// Watchers
watch(search, async (val) => {
    if (!val) return;

    isLoading.value = true;

    try {
        const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}`
        );
        const data = await res.json();
        if (res.ok && data.features) {
            entries.value = data.features.filter(
                (node: any) => node.properties.osm_type === 'R'
            );
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
});

watch(geoJson, (val) => {
    addGeoJson(val);
});

// Methods
function addGeoJson(val: any) {
    mapRef.value?.$mapPromise.then((map: google.maps.Map) => {
        map.data.setMap(null);

        const data = new google.maps.Data({ map });
        if (val) data.addGeoJson(val);

        map.data = data;

        if (val?.bbox) {
            map.fitBounds({
                east: val.bbox[2],
                north: val.bbox[3],
                south: val.bbox[1],
                west: val.bbox[0],
            });
        } else {
            map.setZoom(1);
        }
    });
}

function reset() {
    place.value = '';
    store.dispatch('setGeoJson', null);
}

function next() {
    gameStore.currentComponent = 'settings';
}

onMounted(async () => {
    await mapRef.value?.$gmapApiPromiseLazy();

    if (geoJson.value) addGeoJson(geoJson.value);

    mapRef.value.$mapPromise.then((map: google.maps.Map) => {
        const streetViewLayer = new google.maps.StreetViewCoverageLayer();
        streetViewLayer.setMap(map);
    });
});

CardRoomMixin;
</script>

<style lang="scss" scoped>
.search-bar {
    column-gap: 2rem;
    align-items: baseline;
    padding: 0 1rem;
    margin-bottom: 1rem;
}
</style>
