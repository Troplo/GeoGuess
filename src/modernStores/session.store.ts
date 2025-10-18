import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../plugins/geonextAxios.js';
import { useGameSocketStore } from './socket.store.js';

export const useSessionStore = defineStore('session', () => {
    const currentSession = ref({
        token: null as string | null,
        playerId: null as string | null,
    });

    async function startSession() {
        const { data } = await axios.post('/auth/startSession');
        currentSession.value.token = data.token;
        currentSession.value.playerId = data.playerId;
        useGameSocketStore().init(data.token);
    }

    return {
        currentSession,
        startSession,
    };
});
