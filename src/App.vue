<template>
    <v-app>
        <DialogSaveSync></DialogSaveSync>
        <component :is="useVMain ? VMain : 'div'" style="height: 0px">
            <router-view />
        </component>
        <v-snackbar
            :model-value="syncError"
            location="top right"
            color="red-accent-2"
            :timeout="saving ? -1 : 6000"
        >
            {{ $t('SyncError.label') }}
            <template v-slot:actions="{ attrs }">
                <v-btn
                    color="white"
                    variant="text"
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
            type="info"
            elevation="3"
            prominent
            closable
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
import { VMain } from 'vuetify/components';

export default {
    name: 'App',
    components: { DialogSaveSync, VMain },
    data() {
        return {
            refreshing: false,
            registration: null,
            updateAvailable: false,
        };
    },
    mounted() {
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
        this.$app.getState();
        this.$session.startSession();
        this.$experiments.init();
    },
    computed: {
        VMain() {
            return VMain;
        },
        ...mapState({
            syncError: (state) => state.authStore.syncError,
            history: (state) => state.homeStore.history,
            saving: (state) => state.authStore.saving,
        }),
        useVMain() {
            return !this.$route.path.startsWith('/street-view/');
        },
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
    background-color: rgb(var(--v-theme-gmapBg)) !important;
}
</style>
