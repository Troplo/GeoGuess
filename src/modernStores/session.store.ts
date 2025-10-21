import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../plugins/geonextAxios.js';
import { useGameSocketStore } from './socket.store.js';
import { Room } from '../geonext-server-types/classes/rooms/Room.js';

export const useSessionStore = defineStore('session', () => {
    const currentSession = ref({
        token: null as string | null,
        playerId: null as string | null,
    });
    const quickResume = ref({
        resume: null as null | {
            room: Room;
            kickAt: string;
        },
        dialogValue: false,
    });

    async function startSession(devOverrideName?: string) {
        if (!localStorage.getItem('geoToken') || devOverrideName) {
            startNewSession(!devOverrideName);
        } else {
            renewSession();
        }
    }

    async function startNewSession(save = true) {
        const { data } = await axios.post('/auth/startSession');
        currentSession.value.token = data.token;
        currentSession.value.playerId = data.playerId;
        useGameSocketStore().init(data.token);
        if (save) localStorage.setItem('geoToken', data.token);
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
        quickResume,
    };
});
