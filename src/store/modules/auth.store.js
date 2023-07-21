import * as MutationTypes from '../mutation-types';
import tpuAxios from '@/plugins/tpuAxios';

export default {
    namespaced: true,
    state: {
        user: undefined,
        loading: true,
        saveSyncDialog: false,
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
    },
    actions: {
        async login({ commit }, tkn) {
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
                await tpuAxios.post('/oauth/save', {
                    data: history,
                });
                commit(MutationTypes.AUTH_SET_SAVE_SYNC_DIALOG, false);
            } catch {
                //
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
