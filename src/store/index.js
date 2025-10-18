import Vuex from 'vuex';
function loadModules() {
    const localContext = import.meta.globEager('./modules/*.js');

    const modules = Object.keys(localContext)
        .map((key) => ({ key, name: key.match(/([a-z_]+)(.store)?\.js$/i)[1] }))
        .reduce(
            (m, { key, name }) => ({
                ...m,
                [`${name}Store`]: localContext[key].default,
            }),
            {}
        );

    return { context: localContext, modules };
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
