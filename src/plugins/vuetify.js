import { createVuetify } from 'vuetify';
import { RTL_LANGUAGES } from '@/lang';
import '../scss/variables.scss';

import {
    cs,
    de,
    en,
    es,
    fr,
    he,
    hu,
    ja,
    pt,
    ru,
    sv,
    tr,
    it,
} from 'vuetify/locale';

import i18n from '../lang';

const vuetify = createVuetify({
    theme: {
        themes: {
            light: {
                colors: {
                    primary: '#FFA01F',
                    secondary: '#808F87',
                    accent: '#D0CABC',
                    beige: '#ded3af',
                    darkGreen: '#4F665A',
                    streamerMode: '#9146ff',
                    error: '#ff5252',
                    background: '#ded3af',
                    home: '#ded3af',
                    header: '#f1e9d6',
                    card: '#f1e9d6',
                    notepad: '#fafafa',
                    page: '#ded3af',
                    content: '#f1e9d6',
                    footer: '#7fad94',
                    scrollbar: '#3e3e3e',
                },
            },
            dark: {
                dark: true,
                colors: {
                    primary: '#FFA01F',
                    secondary: '#808F87',
                    accent: '#D0CABC',
                    beige: '#181818',
                    darkGreen: '#FFA01F',
                    streamerMode: '#9146ff',
                    error: '#ff5252',
                    background: '#181818',
                    home: '#181818',
                    header: '#202020',
                    card: '#292929',
                    notepad: '#181818',
                    page: '#181818',
                    content: '#202020',
                    footer: '#202020',
                    scrollbar: '#3e3e3e',
                    gmapBg: '#242f3e',
                },
            },
        },
        defaultTheme:
            localStorage.getItem('darkTheme') === 'true' ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                localStorage.getItem('darkTheme') !== 'false')
                ? 'dark'
                : 'light',
    },
    rtl: RTL_LANGUAGES.includes(i18n.locale),
    lang: {
        locales: { en, fr, ja, cs, de, ru, pt, sv, tr, he, it, hu, es },
        current: i18n.locale,
    },
    icons: {
        iconfont: 'mdi',
    },
});

export default vuetify;
