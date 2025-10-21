import { createVuetify } from 'vuetify';
import { RTL_LANGUAGES } from '@/lang/index.js';
import '../scss/variables.scss';
import 'vuetify/styles';

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

import i18n from '../lang/index.js';

const vuetify = createVuetify({
    theme: {
        themes: {
            light: {
                colors: {
                    primary: '#FFA01F',
                    secondary: '#0190ea',
                    gold: '#ffd707',
                    accent: '#ffffff',
                    beige: '#ffffff',
                    darkGreen: '#4F665A',
                    streamerMode: '#9146ff',
                    error: '#ff5252',
                    background: '#ffffff',
                    home: '#ffffff',
                    header: '#ffffff',
                    card: '#ffffff',
                    notepad: '#fafafa',
                    page: '#ffffff',
                    content: '#ffffff',
                    footer: '#7fad94',
                    scrollbar: '#3e3e3e',
                },
                gmap: [],
            },
            dark: {
                colors: {
                    primary: '#FFA01F',
                    secondary: '#0190ea',
                    gold: '#ffd707',
                    accent: '#D0CABC',
                    beige: '#181818',
                    darkGreen: '#5d8772',
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
                gmap: [
                    {
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#242f3e',
                            },
                        ],
                    },
                    {
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#c0c0c0',
                            },
                        ],
                    },
                    {
                        elementType: 'labels.text.stroke',
                        stylers: [
                            {
                                color: '#242f3e',
                            },
                        ],
                    },
                    {
                        featureType: 'administrative',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#485373',
                            },
                            {
                                visibility: 'on',
                            },
                        ],
                    },
                    {
                        featureType: 'administrative.locality',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#c0c0c0',
                            },
                        ],
                    },
                    {
                        featureType: 'landscape.man_made',
                        elementType: 'geometry.stroke',
                        stylers: [
                            {
                                color: '#38414e',
                            },
                            {
                                visibility: 'on',
                            },
                        ],
                    },
                    {
                        featureType: 'landscape.natural.landcover',
                        elementType: 'geometry.fill',
                        stylers: [
                            {
                                visibility: 'simplified',
                            },
                        ],
                    },
                    {
                        featureType: 'poi',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#c0c0c0',
                            },
                        ],
                    },
                    {
                        featureType: 'poi.park',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#263c3f',
                            },
                        ],
                    },
                    {
                        featureType: 'poi.park',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#6b9a76',
                            },
                        ],
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#38414e',
                            },
                        ],
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry.stroke',
                        stylers: [
                            {
                                color: '#212a37',
                            },
                        ],
                    },
                    {
                        featureType: 'road',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#9ca5b3',
                            },
                        ],
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#746855',
                            },
                        ],
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'geometry.stroke',
                        stylers: [
                            {
                                color: '#1f2835',
                            },
                        ],
                    },
                    {
                        featureType: 'road.highway',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#f3d19c',
                            },
                        ],
                    },
                    {
                        featureType: 'transit',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#2f3948',
                            },
                        ],
                    },
                    {
                        featureType: 'transit.station',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#d59563',
                            },
                        ],
                    },
                    {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [
                            {
                                color: '#17263c',
                            },
                        ],
                    },
                    {
                        featureType: 'water',
                        elementType: 'labels.text.fill',
                        stylers: [
                            {
                                color: '#515c6d',
                            },
                        ],
                    },
                    {
                        featureType: 'water',
                        elementType: 'labels.text.stroke',
                        stylers: [
                            {
                                color: '#17263c',
                            },
                        ],
                    },
                ],
            },
        } as unknown,
        options: {
            customProperties: true,
        },
        defaultTheme: ['dark', 'light'].includes(
            localStorage.getItem('theme') || 'light'
        )
            ? localStorage.getItem('theme') || 'light'
            : 'light',
    },
    rtl: RTL_LANGUAGES.includes(i18n.locale),
    lang: {
        locales: { en, fr, ja, cs, de, ru, pt, sv, tr, he, it, hu, es },
        current: i18n.locale,
    },
    defaults: {
        global: {},
        VMenu: {
            minWidth: 100,
        },
        VWindowItem: {
            transition: false,
            reverseTransition: false,
        },
        VWindow: {
            transition: false,
        },
        VSkeletonLoader: {
            color: 'card',
        },
        VDialog: {},
        VDataTable: {
            fixedHeader: true,
            noDataText: 'No entries yet...',
        },
        VTable: {
            color: 'card',
        },
        VExpansionPanels: {
            color: 'card',
        },
        VExpansionPanel: {
            color: 'toolbar',
        },
        VExpansionPanelHeader: {
            color: 'card',
        },
        VExpansionPanelText: {
            color: 'card',
        },
        VCheckbox: {
            color: 'primary',
        },
        VSwitch: {
            color: 'primary',
            inset: true,
        },
        VToolbar: {
            color: 'toolbar',
        },
        VTab: {
            color: 'primary',
        },
        VSlider: {
            color: 'primary',
        },
        VContainer: {
            fluid: true,
        },
    },
});

export default vuetify;
