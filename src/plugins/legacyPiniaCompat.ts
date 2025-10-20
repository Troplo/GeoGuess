import { App } from 'vue';
import { useSessionStore } from '../modernStores/session.store';
import { useAppStore } from '../modernStores/app.store';
import { useGameSocketStore } from '../modernStores/socket.store.js';
import { useGameStore } from '../modernStores/game.store.js';
import { useExperimentsStore } from '../modernStores/experiments.store.js';

export function setupLegacyPiniaCompat(app: App) {
    app.config.globalProperties.$session = useSessionStore();
    app.config.globalProperties.$app = useAppStore();
    app.config.globalProperties.$gameSocket = useGameSocketStore();
    app.config.globalProperties.$game = useGameStore();
    app.config.globalProperties.$experiments = useExperimentsStore();
}
