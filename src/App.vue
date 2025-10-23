<template>
    <v-app>
        <DialogSaveSync></DialogSaveSync>
        <QuickResumeDialog
            v-if="$session.quickResume.resume"
            :resume="$session.quickResume.resume"
            v-model="$session.quickResume.dialogValue"
        />
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
                <geo-btn
                    color="white"
                    variant="text"
                    v-bind="attrs"
                    :loading="saving"
                    @click="save($home.history)"
                >
                    {{ $t('SyncError.btn') }}
                </geo-btn>
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
                    <geo-btn @click="refreshApp">{{
                        $t('AlertUpdate.btn')
                    }}</geo-btn>
                </v-col>
            </v-row>
        </v-alert>
    </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import DialogSaveSync from '@/components/DialogSaveSync.vue';
import { VMain } from 'vuetify/components';
import QuickResumeDialog from '@/components/resume/QuickResumeDialog.vue';

export default {
    name: 'App',
    components: { QuickResumeDialog, DialogSaveSync, VMain },
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
        this.$session.startSession(this.$route.query.name);
        this.$experiments.init();
    },
    computed: {
        VMain() {
            return VMain;
        },
        ...mapState({
            syncError: (state) => state.authStore.syncError,
            saving: (state) => state.authStore.saving,
        }),
        useVMain() {
            return !this.$route.path.startsWith('/street-view/');
        },
    },
    methods: {
        ...mapActions('authStore', ['login']),
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
            await this.$home.loadHistory();
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

.v-theme--light .shimmer-parent > .shimmer-effect {
    mix-blend-mode: multiply !important;
}

.shimmer-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border-radius: inherit;
    background: radial-gradient(
        circle 150px at var(--shimmer-x, 50%) var(--shimmer-y, 50%),
        rgba(
            var(--shimmer-color, 255, 255, 255),
            var(--shimmer-strength, 0.15)
        ),
        rgba(var(--shimmer-color, 255, 255, 255), 0) 100%
    );
    mix-blend-mode: screen;
    transition: opacity 0.2s ease, background-position 0.1s ease;
    opacity: 0;
}

.shimmer-effect.active {
    opacity: 1;
}
</style>
