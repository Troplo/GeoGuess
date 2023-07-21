module.exports = {
    transpileDependencies: ['vuetify'],
    publicPath:
        process.env.NODE_ENV === 'production' && process.env.VUE_APP_PUBLIC_PATH
            ? process.env.VUE_APP_PUBLIC_PATH
            : '/',
    configureWebpack: (config) => {
        config.resolve['symlinks'] = false;
    },
};
