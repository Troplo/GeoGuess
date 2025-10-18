export default function install(app) {
    app.config.globalProperties.$countryNameLocale = (isoA2) => {
        console.log(app.config.globalProperties.$i18n.global.locale);
        return new Intl.DisplayNames([app.config.globalProperties.$i18n.global.locale], {
            type: 'region',
        }).of(isoA2);
    };
}
