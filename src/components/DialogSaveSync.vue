<template>
    <v-dialog :persistent="true" :value="dialogSaveSync" max-width="700">
        <v-card v-if="user">
            <v-card-title>
                <span class="dialog-save-sync__title">Cloud sync conflict</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-btn
                                block
                                height="300"
                                style="
                                    text-transform: none;
                                    white-space: normal;
                                "
                                @click="doSave('cloud')"
                                :loading="loading"
                            >
                                <div
                                    style="
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                    "
                                >
                                    <v-icon>mdi-cloud-download</v-icon>
                                    <span> Use cloud save </span>
                                    <span>
                                        <small
                                            style="color: #888; font-size: 12px"
                                        >
                                            {{ historyCloud?.length }}
                                            rounds<br />
                                            {{
                                                new Date(
                                                    historyCloud?.[
                                                        historyCloud.length - 1
                                                    ]?.date || 0
                                                ).toLocaleString()
                                            }}
                                        </small>
                                    </span>
                                </div>
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                block
                                height="300"
                                style="
                                    text-transform: none;
                                    white-space: normal;
                                "
                                @click="doSave('local')"
                                :loading="loading"
                            >
                                <div
                                    style="
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                    "
                                >
                                    <v-icon>mdi-cloud-upload</v-icon>
                                    <span> Use local save </span>
                                    <span>
                                        <small
                                            style="color: #888; font-size: 12px"
                                        >
                                            {{ historyLocal?.length }}
                                            rounds<br />
                                            {{
                                                new Date(
                                                    historyLocal[
                                                        historyLocal?.length - 1
                                                    ]?.date
                                                ).toLocaleString()
                                            }}
                                        </small>
                                    </span>
                                </div>
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                block
                                height="300"
                                style="
                                    text-transform: none;
                                    white-space: normal;
                                "
                                @click="doSave('merge')"
                                :loading="loading"
                            >
                                <div
                                    style="
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                    "
                                >
                                    <span>
                                        <v-icon>mdi-cloud-upload</v-icon>
                                        <v-icon class="ml-2"
                                        >mdi-cloud-download</v-icon
                                        >
                                    </span>
                                    <span> Merge local save </span>
                                    <span>
                                        <small
                                            style="color: #888; font-size: 12px"
                                        >
                                            {{ historyLocal.length }}
                                            rounds<br />
                                            {{
                                                new Date(
                                                    historyLocal?.[
                                                        historyLocal.length - 1
                                                    ]?.date
                                                ).toLocaleString()
                                            }}
                                        </small> </span
                                    ><br />
                                    <span style="color: #888; font-size: 12px"
                                    >If in doubt, use this.</span
                                    >
                                </div>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
    name: 'DialogSaveSync',
    data() {
        return {
            loading: false,
        };
    },
    computed: {
        ...mapState({
            dialogSaveSync: (state) => state.authStore.saveSyncDialog,
            user: (state) => state.authStore.user,
        }),
        historyLocal() {
            try {
                return JSON.parse(localStorage.getItem('history'));
            } catch (e) {
                return [];
            }
        },
        historyCloud() {
            return this.user?.save || [];
        },
    },
    methods: {
        ...mapActions(['loadHistory']),
        ...mapActions('authStore', ['save']),
        async doSave(type) {
            if (type === 'cloud') {
                localStorage.setItem(
                    'history',
                    JSON.stringify(this.historyCloud)
                );
                this.loadHistory();
                await this.save(this.historyCloud);
            } else if (type === 'local') {
                localStorage.setItem(
                    'history',
                    JSON.stringify(this.historyLocal)
                );
                this.loading = true;
                await this.save(this.historyLocal);
                this.loadHistory();
            } else if (type === 'merge') {
                let history = this.historyLocal.concat(
                    this.historyCloud.filter(
                        (item) =>
                            !this.historyLocal.find(
                                (item2) => item2.date === item?.date
                            )
                    )
                );
                history = history.sort(
                    (a, b) =>
                        new Date(a.date || 0).getTime() -
                        new Date(b.date || 0).getTime()
                );
                localStorage.setItem('history', JSON.stringify(history));
                this.loading = true;
                await this.save(history);
                this.loadHistory();
            }
            this.loading = false;
        },
    },
});
</script>

<style scoped lang="scss"></style>
