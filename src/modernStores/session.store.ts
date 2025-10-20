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
        if (!localStorage.getItem('token')) {
            startNewSession();
        } else {
            renewSession();
        }
    }

    async function startNewSession() {
        const { data } = await axios.post('/auth/startSession');
        currentSession.value.token = data.token;
        currentSession.value.playerId = data.playerId;
        useGameSocketStore().init(data.token);
        localStorage.setItem('geoToken', data.token);
    }

    async function renewSession() {
        try {
            const { data } = await axios.post('/auth/renewSession', {
                token: localStorage.getItem('geoToken'),
            });
            if (!data.success) {
                startNewSession();
                return;
            }
            currentSession.value.token = data.token;
            currentSession.value.playerId = data.playerId;
            useGameSocketStore().init(data.token);
            localStorage.setItem('geoToken', data.token);
        } catch {
            startNewSession();
        }
    }

    return {
        currentSession,
        startSession,
    };
});
