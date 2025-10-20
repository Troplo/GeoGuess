import { createApp, reactive } from 'vue';
import router from './router.js';
import i18n from './lang';
import { createPinia } from 'pinia';
import store from './store/index';
import App from '@/App.vue';
import axios from '@/plugins/axios';
import vuetify from '@/plugins/vuetify.ts';
import VueGoogleMaps from 'vue-google-maps-community-fork';
import VueAxios from 'vue-axios';
import 'firebase/analytics';
import firebase from 'firebase/app';
import 'firebase/database';
import VueClipboard from 'vue-clipboard2';
import CountryNamePlugin from './plugins/countryNamePlugin';
import './registerServiceWorker.js';
import { setupLegacyPiniaCompat } from '@/plugins/legacyPiniaCompat';
import { init } from '@/plugins/debugOverlay/index.js';

const pinia = createPinia();
export const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueAxios, axios);
app.use(CountryNamePlugin, CountryNamePlugin(app));
app.use(VueClipboard);

app.use(VueGoogleMaps, {
    load: {
        key: import.meta.env.VITE_APP_API_KEY,
    },
});
app.config.productionTip = false;

const updateSizes = (obj = {}) => {
    obj.width = window.innerWidth;
    obj.height = window.innerHeight;
    document.documentElement.style.setProperty(
        '--global-height',
        window.innerHeight + 'px'
    );
    return obj;
};

app.config.globalProperties.$viewport = reactive(updateSizes());

window.addEventListener('resize', () => {
    updateSizes(app.config.globalProperties.$viewport);
});

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
    authDomain:
        import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN ||
        import.meta.env.VITE_APP_FIREBASE_PROJECT_ID + '.firebaseapp.com',
    databaseURL:
        import.meta.env.VITE_APP_FIREBASE_DATABASE_URL ||
        'https://' +
            import.meta.env.VITE_APP_FIREBASE_PROJECT_ID +
            '.firebaseio.com',
    projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
    storageBucket:
        import.meta.env.VITE_APP_STORAGE_BUCKET ||
        import.meta.env.VITE_APP_FIREBASE_PROJECT_ID + '.appspot.com',
    messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
if (firebaseConfig.measurementId) firebase.analytics();

app.use(i18n);
app.config.globalProperties.$i18n = i18n;
app.config.globalProperties.$t = i18n.global.t;
app.config.globalProperties.$tc = i18n.global.t;
app.use(store);

app.use(vuetify);
setupLegacyPiniaCompat(app);
import '@troplo/debug-overlay/dist/debug-overlay.css';
init(app);

app.mount('#app');
