import 'regenerator-runtime/runtime.js';
import { setup } from 'axios-cache-adapter';
import { useSessionStore } from '../modernStores/session.store.js';

const geoNextAxios = setup({
    baseURL: '/api/v1/',
});

geoNextAxios.interceptors.request.use((request) => {
    const sessionStore = useSessionStore();
    request.headers.authorization = sessionStore.currentSession.token;
    return request;
});

export default geoNextAxios;
