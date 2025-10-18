import Vuex from 'vuex';

function loadModules() {
    const context = import.meta.glob('./modules/*.js', {
        eager: true,
        import: 'default',
    });

    const modules = Object.entries(context).reduce((acc, [path, module]) => {
        const name = path.match(/([a-z_]+)(.store)?\.js$/i)[1];
        acc[`${name}Store`] = module;
        return acc;
    }, {});

    return { context, modules };
}

const { context, modules } = loadModules();
const store = new Vuex.Store({
    modules,
});

if (import.meta.hot) {
    // Hot reload whenever any module changes.
    import.meta.hot.accept(context.id, () => {
        const { modules } = loadModules();

        store.hotUpdate({
            modules,
        });
    });
}

export default store;
