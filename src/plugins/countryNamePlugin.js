export default function install(app) {
    app.$countryNameLocale = (isoA2) => {
        return new Intl.DisplayNames([app.prototype.i18n.locale], {
            type: 'region',
        }).of(isoA2);
    };
}
