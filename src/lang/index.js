import { createI18n } from 'vue-i18n';

// Load all modules.
function loadTranslations() {
    if (import.meta.env.NODE_ENV === 'test') return {};

    const modules = import.meta.glob('./locale/([a-z_]+).json', {
        eager: true,
    });
    const translations = {};

    for (const path in modules) {
        const match = path.match(/([a-z_]+)\.json$/i);
        if (match) {
            const name = match[1];
            translations[name] = modules[path];
        }
    }

    return translations;
}

export const translations = loadTranslations();

export const RTL_LANGUAGES = ['he'];

export const languages = Object.keys(translations).map((translation) => ({
    text: new Intl.DisplayNames([translation], { type: 'language' }).of(
        translation
    ),
    value: translation,
}));

export function checkLanguage(language) {
    return navigator.language.split('-')[0] === language.value;
}

if (!localStorage.getItem('language')) {
    localStorage.setItem(
        'language',
        languages.some(checkLanguage) ? navigator.language.split('-')[0] : 'en'
    );
}

const locale =
    localStorage.getItem('language') != null
        ? localStorage.getItem('language')
        : languages.some(checkLanguage)
        ? navigator.language.split('-')[0]
        : 'en';

const i18n = createI18n({
    locale: locale,
    fallbackLocale: 'en',
    messages: translations,
    globalInjection: true,
});

export default i18n;
