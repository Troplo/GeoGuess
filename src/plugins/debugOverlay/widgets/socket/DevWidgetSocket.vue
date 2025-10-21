<template>
    <v-btn @click="disconnectSocket"> Disconnect Socket </v-btn>
    <v-btn @click="reconnectSocket"> Reconnect Socket </v-btn>
    <v-btn @click="forceOffline"> Force Offline </v-btn>
    <v-btn @click="forceOnline"> Force Online </v-btn>
    <v-btn @click="forceOnline"> Interrupt Socket </v-btn>
</template>

<script setup lang="ts">
import { useGameSocketStore } from '@/modernStores/socket.store.js';

const gameSocketStore = useGameSocketStore();

function disconnectSocket() {
    console.log(gameSocketStore._socket);
    if (gameSocketStore._socket && gameSocketStore._socket.connected) {
        gameSocketStore._socket.disconnect();
    }
}

function reconnectSocket() {
    if (gameSocketStore._socket && !gameSocketStore._socket.connected) {
        gameSocketStore._socket.connect();
    }
}

function forceOffline() {
    if (gameSocketStore._socket) {
        gameSocketStore._socket.disconnect();
        console.log('Socket forced offline');
    }
}

function forceOnline() {
    if (gameSocketStore._socket && !gameSocketStore._socket.connected) {
        gameSocketStore._socket.connect();
        console.log('Socket forced online');
    }
}

function interruptSocket() {
    if (gameSocketStore._socket) {
        // forcibly close socket and prevent reconnection
        const transport = gameSocketStore.socket.io.engine.transport;
        if (transport && transport.ws) {
            transport.ws.close();
        }
    }
}
</script>

<style scoped lang="scss"></style>
