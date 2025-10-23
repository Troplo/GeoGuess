import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '@/plugins/axios';
import { getGeoJsonFromUrl, getLocateString, isGeoJSONValid } from '@/utils';
import i18n from '../lang';
import { GeoMap, GeoMapCustom, GeoMapOSM, GeoMapType } from '../models/GeoMap';
import IndexedDBService from '../plugins/IndexedDBService.js';
import { useAlertStore } from './alert.store.js';

export const useHomeStore = defineStore('home', () => {
    const map = ref(new GeoMapCustom());
    const loadingGeoJson = ref(false);
    const errorMessage = ref(null);
    const listMaps = ref([]);
    const listAreas = ref([]);
    const customsMaps = ref([]);
    const history = ref([]);
    const streamerMode = ref(localStorage.getItem('streamerMode') === 'true');

    const geoJsonString = computed(() => {
        if (!map.value || !map.value.geojson) return '';
        return JSON.stringify(map.value.geojson, null, 2);
    });

    const geoJson = computed(() => map.value.geojson);

    const isValidGeoJson = computed(() => {
        if (!map.value || !map.value.geojson) return null;
        return isGeoJSONValid(map.value.geojson);
    });

    const maps = computed(() =>
        customsMaps.value
            .map((m) => Object.assign(new GeoMapCustom(), m))
            .concat(listMaps.value.map((m) => Object.assign(new GeoMap(), m)))
    );

    const areasList = computed(() =>
        listAreas.value.map((area) => ({
            ...area,
            imageSrc:
                area.imageUrl ||
                `https://source.unsplash.com/500x230/weekly?${encodeURI(
                    getLocateString(area, 'name', 'en')
                )}`,
            nameLocate: getLocateString(area, 'name', i18n.locale),
            descriptionLocate: getLocateString(
                area,
                'description',
                i18n.locale
            ),
        }))
    );

    const nbPlaceVisits = computed(() =>
        history.value.reduce((a, { rounds }) => a + rounds.length, 0)
    );

    function getMaxScoreMap(mapInput) {
        return history.value.reduce((acc, { points, mapDetails }) => {
            if (
                mapDetails &&
                mapDetails.id &&
                mapDetails.id === mapInput.id &&
                mapDetails.type === mapInput.type &&
                acc < points
            ) {
                return points;
            }
            return acc;
        }, 0);
    }

    function getMaxScoreOsm({ osmId, osmType }) {
        return history.value.reduce((acc, { points, mapDetails, nbRound }) => {
            if (
                !nbRound ||
                (nbRound === 5 &&
                    mapDetails &&
                    mapDetails.type === GeoMapType.OSM &&
                    mapDetails.osmId === osmId &&
                    mapDetails.osmType === osmType &&
                    acc < points)
            ) {
                return points;
            }
            return acc;
        }, 0);
    }

    function setGeoJson(geojson) {
        const newMap = new GeoMapCustom();
        newMap.name = map.value.name;
        newMap.geojson = geojson;
        map.value = newMap;
    }

    function setGeoJsonName(name) {
        map.value.name = name;
    }

    function setMap(newMap) {
        map.value = newMap;
    }

    function setLists(lists) {
        listMaps.value = lists.maps;
        listAreas.value = lists.areas;
    }

    function setCustomMaps(customMapsData) {
        customsMaps.value = customMapsData;
    }

    function setHistory(historyData) {
        history.value = historyData;
    }

    function setStreamerMode(value) {
        streamerMode.value = value;
        localStorage.setItem('streamerMode', value);
        const alertStore = useAlertStore();
        if (value) {
            alertStore.setAlert({
                title: 'Home.streamerModeActivate',
                subtitle: 'Home.streamerModeDetails',
                color: 'streamerMode',
                icon: 'mdi-twitch',
            });
        }
    }

    function setLoadingGeoJson(status) {
        loadingGeoJson.value = status;
    }

    function setGeoJsonError(error) {
        errorMessage.value = error;
    }

    async function loadPlaceGeoJSON(payload) {
        let place, osmId;
        if (typeof payload === 'string') {
            place = payload;
        } else {
            place = payload.place;
            osmId = payload.osmId;
        }

        if ((place && place !== '') || osmId) {
            if (loadingGeoJson.value) return;

            setLoadingGeoJson(true);
            setGeoJson(null);

            const url = osmId
                ? `https://nominatim.openstreetmap.org/lookup?osm_ids=R${osmId}&format=geojson&polygon_geojson=1&accept-language=en`
                : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                      place.toLowerCase()
                  )}&format=geojson&limit=1&polygon_geojson=1`;

            try {
                const res = await axios.get(url);
                if (res && res.status === 200 && res.data.features.length > 0) {
                    const feature = res.data.features[0];
                    const newMap = new GeoMapOSM(
                        feature.properties.display_name,
                        feature.properties.osm_id,
                        feature.properties.osm_type,
                        feature
                    );
                    setMap(newMap);
                } else {
                    setGeoJsonError('No Found Location');
                }
            } finally {
                setLoadingGeoJson(false);
            }
        }
    }

    async function loadMapData(mapData) {
        const geojson = await getGeoJsonFromUrl(mapData.url);
        if (geojson) {
            mapData.geojson = geojson;
            setMap(mapData);
        }
    }

    async function loadGeoJsonFromUrl(url) {
        const geojson = await getGeoJsonFromUrl(url);
        if (geojson) {
            setGeoJson(geojson);
        }
    }

    async function saveGeoJson() {
        await map.value.save();
        await getListMapsCustoms();
        const alertStore = useAlertStore();
        alertStore.setAlert({
            title: 'Home.mapSavedAlert.title',
            subtitle: 'Home.mapSavedAlert.subtitle',
        });
    }

    function setGeoJsonString(geojson) {
        let obj = null;
        if (geojson !== '') obj = JSON.parse(geojson);
        setGeoJson(obj);
    }

    async function getListMaps() {
        const data = await axios
            .get(
                import.meta.env.VITE_APP_LIST_MAPS_JSON_URL ||
                    'https://maps.geoguess.games/maps.json',
                { cache: { maxAge: 1000 } }
            )
            .then((res) => res.data);
        setLists(data);
    }

    async function getListMapsCustoms() {
        const customMapsData = await IndexedDBService.loadDb().then(
            async () => {
                return IndexedDBService.getAllMaps();
            }
        );
        setCustomMaps(customMapsData);
    }

    function loadHistory() {
        const data = localStorage.getItem('history')
            ? JSON.parse(localStorage.getItem('history'))
            : [];
        setHistory(data);
    }

    return {
        map,
        loadingGeoJson,
        errorMessage,
        listMaps,
        listAreas,
        customsMaps,
        history,
        streamerMode,
        geoJsonString,
        geoJson,
        isValidGeoJson,
        maps,
        areasList,
        nbPlaceVisits,
        getMaxScoreMap,
        getMaxScoreOsm,
        setGeoJson,
        setGeoJsonName,
        setMap,
        setLists,
        setCustomMaps,
        setHistory,
        setStreamerMode,
        setLoadingGeoJson,
        setGeoJsonError,
        loadPlaceGeoJSON,
        loadMapData,
        loadGeoJsonFromUrl,
        saveGeoJson,
        setGeoJsonString,
        getListMaps,
        getListMapsCustoms,
        loadHistory,
    };
});
