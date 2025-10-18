import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import axios from '../plugins/geonextAxios.js';

export const useAppStore = defineStore('app', () => {
    const site = ref({
        requireAuth: false,
        environment: 'production',
        googleApiKey: '',
        tpuAppId: null,
    });

    async function getState() {
        const { data } = await axios.get('/core');
        site.value = data;
    }

    return {
        site,
        getState,
    };
});
