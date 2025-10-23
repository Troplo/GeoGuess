import { createApp } from 'vue';
import countryNamePlugin from '/src/plugins/countryNamePlugin';
import { describe, it, expect } from 'vitest';

describe('countryNamePlugin.js', () => {
    function factory(locale) {
        const app = createApp({});
        app.use(countryNamePlugin);

        // Mock Vue I18n instance structure
        app.config.globalProperties.$i18n = {
            global: { locale: { value: locale } },
        };

        return app.config.globalProperties;
    }

    it('$countryNameLocale should return Tunisie if french', () => {
        const globals = factory('fr');
        expect(globals.$countryNameLocale('TN')).toBe('Tunisie');
    });

    it('$countryNameLocale should return Tunisia if it', () => {
        const globals = factory('it');
        expect(globals.$countryNameLocale('TN')).toBe('Tunisia');
    });
});
