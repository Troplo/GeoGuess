import { install } from '@troplo/debug-overlay';
import type { App } from 'vue';
import { registerGeoGuessWidgets } from './widgets/geoguess.ts';

export function init(app: App) {
    install({
        useFramework: true,
        log: true,
        platform: {
            version: '3.0.0',
            name: 'GeoGuess (GeoNEXT Edition)',
            environment: import.meta.env.DEV ? 'dev' : 'prod',
        },
        app: app,
    });

    registerGeoGuessWidgets();
}
