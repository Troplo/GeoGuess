<template>
    <v-app>
        <DialogSaveSync></DialogSaveSync>
        <router-view />
        <v-snackbar
            :value="syncError"
            top
            right
            color="rounded-xl red accent-2"
            :timeout="saving ? -1 : 6000"
        >
            {{ $t('SyncError.label') }}
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="white"
                    text
                    v-bind="attrs"
                    @click="save(history)"
                    :loading="saving"
                >
                    {{ $t('SyncError.btn') }}
                </v-btn>
            </template>
        </v-snackbar>
        <v-alert
            v-model="updateAvailable"
            id="alertUpdate"
            dark
            type="info"
            elevation="3"
            prominent
            dismissible
        >
            <v-row align="center">
                <v-col class="grow">
                    {{ $t('AlertUpdate.label') }}
                </v-col>
                <v-col class="shrink">
                    <v-btn @click="refreshApp">{{
                        $t('AlertUpdate.btn')
                    }}</v-btn>
                </v-col>
            </v-row>
        </v-alert>
    </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import DialogSaveSync from '@/components/DialogSaveSync.vue';

export default {
    name: 'App',
    components: { DialogSaveSync },
    data() {
        return {
            refreshing: false,
            registration: null,
            updateAvailable: false,
        };
    },
    created() {
        // Listen for our custom event from the SW registration
        document.addEventListener('swUpdated', this.setUpdate, { once: true });
        if (navigator.serviceWorker)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Prevent multiple refreshes
                if (this.refreshing) return;
                this.refreshing = true;

                window.location.reload();
            });
        this.handleCloudSync();
    },
    computed: {
        ...mapState({
            syncError: (state) => state.authStore.syncError,
            history: (state) => state.homeStore.history,
            saving: (state) => state.authStore.saving,
        }),
    },
    methods: {
        ...mapActions('authStore', ['login']),
        ...mapActions(['loadHistory']),
        ...mapActions('authStore', ['save']),
        setUpdate(event) {
            this.registration = event.detail;
            this.updateAvailable = true;
        },
        refreshApp() {
            this.updateAvailable = false;
            if (!this.registration || !this.registration.waiting) return;
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        },
        async handleCloudSync() {
            await this.login();
            await this.loadHistory();
        },
    },
};
</script>

<style lang="scss" scoped>
#alertUpdate {
    position: fixed;
    bottom: 2%;
    right: 5%;
    width: 90%;
}
</style>

<style>
.gm-style {
    background-color: var(--v-gmapBg-base) !important;
}
</style>
