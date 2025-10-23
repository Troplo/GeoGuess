<template>
    <div id="map">
        <GMapMap
            id="mapClassic"
            ref="mapRef"
            :center="{ lat: 37.86926, lng: -122.254811 }"
            :zoom="1"
            map-type-id="roadmap"
            :options="{
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                draggableCursor: 'crosshair',
                clickableIcons: false,
                styles:
                    $vuetify.theme.global.name === 'dark'
                        ? $vuetify.theme.themes.dark.gmap
                        : $vuetify.theme.themes.light.gmap,
                gestureHandling: 'greedy',
            }"
        />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { STROKE_COLORS } from '../../constants';
import type {
    LatLng,
    Map as GoogleMap,
    Marker as GoogleMarker,
    Polyline as GooglePolyline,
} from 'google.maps';
import { useMap } from '@/components/map/composables/useMap.js';
import { useI18n } from 'vue-i18n';

interface MarkerInfo {
    position: LatLng;
    label?: string;
    isRandomLocation?: boolean;
}

let map: GoogleMap | null = null;
// Markers/Polylines can't be a Vue reactive proxy, or they cannot be deleted.
let markers = [];
let polylines = [];
const strokeColors = STROKE_COLORS;

const mapRef = ref<GoogleMap>(null);
const bbox = ref<null | number[]>();

const mapComposable = useMap({
    map: mapRef,
    bbox: bbox,
});

const { t, locale } = useI18n();

const emit = defineEmits(['setSelectedPos']);

onMounted(async () => {
    await (globalThis as any).$gmapApiPromiseLazy?.();
    mapRef.value.$mapPromise.then((gmap: GoogleMap) => {
        map = gmap;
        mapComposable.centerOnBbox();
        startNextRound();
    });
});

function putMarker(position: LatLng, isRandomLocation = false, label?: string) {
    let info: Partial<google.maps.MarkerOptions> = {};

    if (isRandomLocation) {
        info.icon = {
            url: window.location.origin + '/img/icons/StreetGuessPin.svg',
            anchor: new google.maps.Point(12, 34),
        };
    } else {
        info.icon = {
            url: window.location.origin + '/img/icons/StreetGuessPlayer.svg',
            anchor: new google.maps.Point(12, 34),
        };
    }

    if (label) {
        info.label = label;
    }

    const marker = new google.maps.Marker({
        ...info,
        position,
        map: map,
    });

    markers.push(marker);
}

function removeMarkers() {
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
}

function setInfoWindow(
    playerName: string | null,
    distance: number,
    points: number,
    endGame = false
) {
    let dataToDisplay = '';

    if (playerName) {
        dataToDisplay += `<b>${playerName}</b> : <br/>`;
    }

    if (distance < 1000) {
        dataToDisplay +=
            `<b>${t('Maps.infoWindow.Distance')}:</b> ` +
            new Intl.NumberFormat(locale.value, {
                style: 'unit',
                unit: 'meter',
            }).format(distance);
    } else {
        dataToDisplay +=
            `<b>${t('Maps.infoWindow.Distance')}:</b> ` +
            new Intl.NumberFormat(locale.value, {
                style: 'unit',
                unit: 'kilometer',
            }).format(distance / 1000);
    }

    dataToDisplay += `<br/><b>${t('Maps.infoWindow.Points')}:</b> ${points}`;

    const infoWindow = new google.maps.InfoWindow({ content: dataToDisplay });
    const markerIndex = playerName || endGame ? markers.length - 1 : 0;
    infoWindow.open(map!, markers[markerIndex]);
}

function drawPolyline(selectedLatLng: LatLng, i = 0, randomLatLng: LatLng) {
    const lineSymbol: google.maps.Symbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 2,
    };

    const polyline = new google.maps.Polyline({
        path: [selectedLatLng, randomLatLng],
        strokeOpacity: 0,
        strokeColor: strokeColors[i % strokeColors.length],
        icons: [{ icon: lineSymbol, offset: '0', repeat: '10px' }],
    });

    polyline.setMap(map!);
    polylines.push(polyline);
}

function removePolylines() {
    for (let i = 0; i < polylines.length; i++) {
        polylines[i].setMap(null);
    }
    polylines = [];
}

function startNextRound() {
    mapRef.value.$mapPromise.then(() => {
        map!.addListener('click', (e: google.maps.MapMouseEvent) => {
            removeMarkers();
            if (e.latLng) putMarker(e.latLng);
            emit('setSelectedPos', e.latLng!);
        });
        mapComposable.centerOnBbox();
    });
}

function removeListener() {
    google.maps.event.clearListeners(map!, 'click');
}

function fitBounds() {
    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
        if (markers[i].getVisible()) {
            bounds.extend(markers[i].getPosition());
        }
    }
    map!.fitBounds(bounds);
}

defineExpose({
    fitBounds,
    removeListener,
    startNextRound,
    drawPolyline,
    setInfoWindow,
    putMarker,
    removeMarkers,
    removePolylines,
    centerOnBbox: mapComposable.centerOnBbox,
});
</script>

<style lang="scss" scoped>
#mapClassic {
    width: 100%;
    height: 100%;
    background-color: rgb(var(--v-theme-gmapBg));
}

.gm-style-iw {
    color: black;
}

.vue-map-container {
    height: 100%;
}
</style>
