<template>
    <g-map-map
        style="width: 100%; height: 100%"
        v-bind="$attrs"
        :options="{
            ...(options || {}),
            styles: gmapTheme[theme.name.value],
        }"
        ref="mapCore"
    >
    </g-map-map>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useTheme } from 'vuetify/framework';

defineProps<{
    options: any;
}>();

const mapCore = ref(null);
let isReady = false;

defineExpose({
    map: mapCore,
});

const emit = defineEmits<{
    (event: 'onReady'): void;
}>();

watch(
    () => mapCore.value,
    (newValue) => {
        if (!isReady && newValue['$gmapApiPromiseLazy']) {
            isReady = true;
            emit('onReady');
        }
    }
);

// const hasDirectionsResult = ref(false);
//
// const mapsApiKey = import.meta.env.VITE_APP_API_KEY;
// const center = { lat: 40.689247, lng: -74.044502 };
//
const theme = useTheme();

const gmapTheme = {
    light: [],
    hybrid: [],
    dark: [
        {
            elementType: 'geometry',
            stylers: [
                {
                    color: '#242f3e',
                },
            ],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#c0c0c0',
                },
            ],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#242f3e',
                },
            ],
        },
        {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#485373',
                },
                {
                    visibility: 'on',
                },
            ],
        },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#c0c0c0',
                },
            ],
        },
        {
            featureType: 'landscape.man_made',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#38414e',
                },
                {
                    visibility: 'on',
                },
            ],
        },
        {
            featureType: 'landscape.natural.landcover',
            elementType: 'geometry.fill',
            stylers: [
                {
                    visibility: 'simplified',
                },
            ],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#c0c0c0',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#263c3f',
                },
            ],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#6b9a76',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#38414e',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#212a37',
                },
            ],
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#9ca5b3',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#746855',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: '#1f2835',
                },
            ],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#f3d19c',
                },
            ],
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#2f3948',
                },
            ],
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#d59563',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: '#17263c',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    color: '#515c6d',
                },
            ],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    color: '#17263c',
                },
            ],
        },
    ],
};
</script>

<style>
.vue-map-container {
    height: 100%;
}
</style>
