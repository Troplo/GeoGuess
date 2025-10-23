import { createApp, reactive } from 'vue';
import VueClipboard from 'vue-clipboard3';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import Vuetify from 'vuetify';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import enLocale from '@/lang/locale/en.json';
import countryNamePlugin from '/src/plugins/countryNamePlugin';
import GmapVue from 'vue-google-maps-community-fork';

global.File = class MockFile {
    constructor(parts, filename, properties) {
        this.parts = parts;
        this.filename = filename;
        this.properties = properties;
    }
    text() {
        return Promise.resolve(this.parts.toString());
    }
};

export default function appInit(useRouter = true) {
    const app = createApp({});

    // Reactive viewport
    const viewport = reactive({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    app.config.globalProperties.$viewport = viewport;

    // Plugins
    app.use(Vuetify, {
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
    });
    app.use(createStore({}));
    app.use(VueClipboard);
    app.use(GmapVue, {
        load: {
            key: 'google-maps-api-key',
        },
        installComponents: true,
    });
    app.use(countryNamePlugin);

    // I18n
    const i18n = createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: { en: enLocale },
    });
    app.use(i18n);

    // Router
    let router;
    if (useRouter) {
        router = createRouter({
            history: createWebHistory(),
            routes: [],
        });
        app.use(router);
    }

    return { app, i18n, router };
}
