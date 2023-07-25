import * as MutationTypes from '../mutation-types';
import tpuAxios from '@/plugins/tpuAxios';

export default {
    namespaced: true,
    state: {
        user: undefined,
        loading: true,
        saveSyncDialog: false,
        saving: false,
        syncError: false,
    },
    mutations: {
        [MutationTypes.AUTH_SET_USER](state, user) {
            state.user = user;
        },
        [MutationTypes.AUTH_SET_LOADING](state, loading) {
            state.loading = loading;
        },
        [MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG](state, saveSyncDialog) {
            state.saveSyncDialog = saveSyncDialog;
        },
        [MutationTypes.AUTH_SET_SAVING](state, saving) {
            state.saving = saving;
        },
        [MutationTypes.AUTH_SET_SYNC_ERROR](state, syncError) {
            state.syncError = syncError;
        },
    },
    actions: {
        async login({ commit, dispatch }, tkn) {
            try {
                const token = tkn || localStorage.getItem('token');
                if (!token) {
                    commit(MutationTypes.AUTH_SET_USER, null);
                    commit(MutationTypes.AUTH_SET_LOADING, false);
                    return;
                }

                if (tkn) {
                    localStorage.setItem('token', token);
                    tpuAxios.defaults.headers.common['Authorization'] = token;
                }

                commit(MutationTypes.AUTH_SET_LOADING, true);
                const { data } = await tpuAxios.get('/oauth/user', {
                    headers: {
                        Authorization: token,
                    },
                });
                let show = false;
                const history = localStorage.getItem('history');
                try {
                    const parsedHistory = JSON.parse(history);
                    if (data.save[0].date !== parsedHistory[0].date) {
                        show = true;
                    }
                } catch {
                    //
                }
                if (!data.save || show) {
                    commit(MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG, true);
                } else if (history) {
                    const parsedHistory = JSON.parse(history);
                    let merged = parsedHistory.concat(
                        data.save.filter(
                            (item) =>
                                !parsedHistory.find(
                                    (item2) => item2.date === item?.date
                                )
                        )
                    );
                    merged = merged.sort(
                        (a, b) =>
                            new Date(a.date || 0).getTime() -
                            new Date(b.date || 0).getTime()
                    );
                    localStorage.setItem('history', JSON.stringify(merged));
                    if (
                        merged.length !== data.save.length ||
                        merged.length !== parsedHistory.length
                    ) {
                        dispatch('save', merged);
                    }
                } else {
                    localStorage.setItem('history', JSON.stringify(data.save));
                }
                commit(MutationTypes.AUTH_SET_USER, data);
                commit(MutationTypes.AUTH_SET_LOADING, false);
            } catch {
                commit(MutationTypes.AUTH_SET_LOADING, false);
            }
        },
        async save({ commit }, history) {
            try {
                if (!history) return;
                commit(MutationTypes.AUTH_SET_SAVING, true);
                await tpuAxios.post('/oauth/save', {
                    data: history,
                });
                commit(MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG, false);
                commit(MutationTypes.AUTH_SET_SAVING, false);
                commit(MutationTypes.AUTH_SET_SYNC_ERROR, false);
            } catch {
                commit(MutationTypes.AUTH_SET_SAVING, false);

                if (localStorage.getItem('token')) {
                    commit(MutationTypes.AUTH_SET_SYNC_ERROR, true);
                }
            }
        },
        cloudConflict({ commit }, value) {
            commit(MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG, value);
        },
        logout({ commit }) {
            commit(MutationTypes.AUTH_SET_USER, null);
            commit(MutationTypes.AUTH_SET_LOADING, false);
            commit(MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG, false);
            localStorage.removeItem('token');
            localStorage.removeItem('history');
        },
    },
};
