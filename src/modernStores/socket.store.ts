import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import { io, Socket } from 'socket.io-client';

export const useGameSocketStore = defineStore('sockets.game', () => {
    const socket: Socket | null = null;
    const ready = ref(false);

    async function init(token: string) {
        this.socket = io({
            auth: {
                token,
            },
            path: '/api/v1/socket/game',
            transports: ['websocket'],
        });
        await initHandlers();
    }

    async function initHandlers() {
        if (!socket) return;

        this.ready = true;
    }

    return {
        init,
        ready,
    };
});
