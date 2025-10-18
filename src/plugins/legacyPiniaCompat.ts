import { App } from 'vue';
import { useSessionStore } from '../modernStores/session.store';

export function setupLegacyPiniaCompat(app: App) {
    app.config.globalProperties.$session = useSessionStore();
}
