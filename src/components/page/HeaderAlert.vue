<template>
    <v-alert
        v-if="!!alert"
        type="success"
        closable
        height="64"
        decelerated-easing
        :icon="alert.icon"
        :color="alert.color"
        @update:model-value="closeAlert"
    >
        <h4>{{ $t(alert.title) }}</h4>
        <p>{{ $t(alert.subtitle) }}</p>
    </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAlertStore } from '@/modernStores/alert.store.js';

const alertStore = useAlertStore();
const alert = computed(() => alertStore.alert);

function closeAlert() {
    alertStore.setAlert(null);
}
</script>
