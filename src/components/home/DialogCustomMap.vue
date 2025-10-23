<template>
    <v-dialog
        :model-value="visibility"
        scrollable
        :fullscreen="$viewport.width < 450"
        @update:model-value="$emit('change-visibility')"
    >
        <v-card class="dialog-customs">
            <geo-btn class="close-btn" icon @click="$emit('change-visibility')">
                <v-icon>mdi-close</v-icon>
            </geo-btn>
            <v-card-title>
                <p>{{ $t('DialogCustomMap.title') }}</p>
            </v-card-title>
            <v-card-text>
                <v-row no-gutters class="dialog-customs__row">
                    <v-col md="6" sm="12" class="mr-6">
                        <v-row class="mt-2 mr-3 ml-1 mb-5" align="stretch">
                            <v-text-field
                                :placeholder="
                                    $t('DialogCustomMap.inputName.placeholder')
                                "
                                :label="$t('DialogCustomMap.inputName.label')"
                                :model-value="mapName"
                                @update:model-value="setMapName"
                                variant="filled"
                                :loading="loadingSave"
                                hide-details
                            />

                            <SaveButton
                                class="ml-2 mt-2"
                                color="dark"
                                :dark="!isSaveAllowed"
                                @click="saveMap"
                                :disabled="isSaveAllowed"
                                :loading="loadingSave"
                            >
                                <v-icon start> mdi-content-save </v-icon>
                                {{ $t('DialogCustomMap.save') }}
                            </SaveButton>
                        </v-row>
                        <v-skeleton-loader
                            v-if="loading"
                            class="mx-auto"
                            height="550"
                            type="image"
                        />
                        <div v-else>
                            <v-alert
                                v-if="isValidGeoJson === false"
                                type="error"
                                standard-easing
                            >
                                {{ $t('DialogCustomMap.invalid') }}
                            </v-alert>

                            <GMapMap
                                ref="mapRef"
                                :center="{ lat: 10, lng: 10 }"
                                :zoom="1"
                                map-type-id="roadmap"
                                style="width: 100%; height: 530px"
                                :options="{
                                    gestureHandling: 'greedy',
                                    styles:
                                        $vuetify.theme.global.name === 'dark'
                                            ? $vuetify.theme.themes.dark.gmap
                                            : $vuetify.theme.themes.light.gmap,
                                }"
                            />
                            <v-row>
                                <geo-btn
                                    class="mt-6 mr-auto ml-auto"
                                    color="secondary"
                                    size="small"
                                    @click="downloadGeoJson"
                                >
                                    <v-icon start> mdi-cloud-download </v-icon>
                                    {{ $t('DialogCustomMap.download') }}
                                </geo-btn>
                            </v-row>
                        </div>
                    </v-col>

                    <v-col>
                        <v-radio-group v-model="type" inline>
                            <v-radio
                                :label="$t('DialogCustomMap.text')"
                                value="text"
                            />
                            <v-radio
                                :label="$t('DialogCustomMap.url')"
                                value="url"
                            />
                            <v-radio
                                :label="$t('DialogCustomMap.file')"
                                value="file"
                            />
                            <v-radio
                                :label="$t('DialogCustomMap.edit')"
                                value="edit"
                            />
                        </v-radio-group>
                        <v-file-input
                            v-if="type === 'file'"
                            v-model="file"
                            :label="$t('DialogCustomMap.fileLabel')"
                            prepend-icon="mdi-map"
                        />
                        <v-text-field
                            v-else-if="type === 'url'"
                            v-model="url"
                            placeholder="https://gist.github.com/..."
                            label="Url"
                            type="text"
                            :rules="rulesUrl"
                        />

                        <v-textarea
                            v-else
                            :error="isValidGeoJson !== null && !isValidGeoJson"
                            :model-value="geoJsonString"
                            :placeholder="placeholderGeoJson"
                            :rules="rulesTextArea"
                            rows="21"
                            variant="filled"
                            clearable
                            :loading="loading"
                            @update:model-value="onChangeTextArea"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <geo-btn @click="clean" color="error">
                    {{ $t('DialogCustomMap.Clean') }}
                </geo-btn>
                <geo-btn color="primary" @click="$emit('change-visibility')">
                    {{ $t('DialogCustomMap.OK') }}
                </geo-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, watchEffect } from 'vue';
import { validURL, download, isGeoJSONValid } from '@/utils';
import { GeoMapCustom } from '@/models/GeoMap';
import SaveButton from '@/components/shared/SaveButton.vue';
import { useHomeStore } from '@/modernStores/home.store';
import { waitForGoogle } from '@/plugins/waitForGoogle.js';

const props = defineProps({
    visibility: Boolean,
});

const homeStore = useHomeStore();

const rulesUrl = [(value) => validURL(value)];
const rulesTextArea = [(value) => checkIfStringGeoJsonValid(value)];
const type = ref('text');
const file = ref(null);
const url = ref('');
const initMap = ref(false);
const editMap = ref(false);
const loading = ref(false);
const loadingSave = ref(false);

const mapName = computed(() => homeStore.map.name);
const geoJson = computed(() => homeStore.geoJson);
const geoJsonString = computed(() => homeStore.geoJsonString);
const isValidGeoJson = computed(() => homeStore.isValidGeoJson);

const placeholderGeoJson = computed(() =>
    loading.value ? '' : geoJsonExample
);

const isSaveAllowed = computed(() => {
    return (
        mapName.value === '' || !geoJson.value || isValidGeoJson.value === false
    );
});

function checkIfStringGeoJsonValid(string) {
    try {
        return isGeoJSONValid(JSON.parse(string));
    } catch {
        return false;
    }
}

function onChangeTextArea(e) {
    homeStore.setGeoJsonString(e);
}

function onChangeMap() {
    editMap.value = true;
    mapRef.value.$mapPromise.then((map) => {
        map.data.toGeoJson((geoJson) => homeStore.setGeoJson(geoJson));
    });
}

function downloadGeoJson() {
    download(
        geoJsonString.value,
        'geoguessMap_' + new Date().toISOString() + '.geojson',
        'application/vnd.geo+json'
    );
}

async function saveMap() {
    loadingSave.value = true;
    await homeStore.saveGeoJson();
    loadingSave.value = false;
}

function clean() {
    homeStore.setMap(new GeoMapCustom());
    url.value = '';
}

const mapRef = ref(null);

watch(
    () => geoJson.value,
    (v) => {
        if (!mapRef.value) return;
        if (!editMap.value) {
            mapRef.value.$mapPromise.then((map) => {
                let data = new google.maps.Data({
                    map: map,
                    style: map.data.getStyle(),
                    controls: map.data.getControls(),
                });
                data.addGeoJson(v);

                if (type.value === 'edit') {
                    data.addListener('addfeature', onChangeMap);
                    data.addListener('removefeature', onChangeMap);
                    data.addListener('setgeometry', onChangeMap);
                }

                map.data.setMap(null);
                map.data = data;
            });
        } else {
            editMap.value = false;
        }
    }
);

watch(file, (f) => {
    if (typeof f === 'object' && !!f.text) {
        f.text().then((content) => {
            homeStore.setGeoJsonString(content);
        });
    }
});

watch(url, (value) => {
    homeStore.loadGeoJsonFromUrl(value);
});

watch(type, (t) => {
    mapRef.value?.$mapPromise.then((map) => {
        if (t === 'edit') {
            map.data.setControls(['Point', 'Polygon']);
            map.data.setStyle({
                editable: true,
                draggable: true,
            });
        } else {
            map.data.setControls(null);
            map.data.setStyle({});
        }
    });
});

onMounted(async () => {
    if ('launchQueue' in window) {
        launchQueue.setConsumer((launchParams) => {
            if (
                !Array.isArray(launchParams.files) ||
                launchParams.files.length !== 1
            )
                return;
            launchParams.files[0].getFile().then((f) => {
                loading.value = true;
                f.text()
                    .then((content) => homeStore.setGeoJsonString(content))
                    .finally(() => {
                        loading.value = false;
                    });
            });
        });
    }
});

watchEffect(async () => {
    if (!initMap.value) {
        await nextTick();
        if (mapRef.value) {
            mapRef.value.$mapPromise.then((map) => {
                const streetViewLayer =
                    new google.maps.StreetViewCoverageLayer();
                streetViewLayer.setMap(map);
                let data = new google.maps.Data({ map });
                if (geoJson.value) data.addGeoJson(geoJson.value);
                map.data.setMap(null);
                map.data = data;
                map.data.addListener('addfeature', onChangeMap);
                map.data.addListener('removefeature', onChangeMap);
                map.data.addListener('setgeometry', onChangeMap);
                initMap.value = true;
            });
        }
    }
});

const geoJsonExample = `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0,0.0],[10.0,0.0],[10,20],[0.0,20],[0,0.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[0,0.0],[10.0,0.0],[10,20],[0.0,20],[0,0.0]]]
      }
    }
  ]
}`;
</script>

<style lang="scss" scoped>
.dialog-customs {
    background: #fffaec;
}

@media (max-width: 400px) {
    .v-card__text {
        width: calc(100% - 25px);
    }
    .dialog-customs__row {
        display: block;
    }
}
</style>
