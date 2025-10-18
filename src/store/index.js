import Vuex from 'vuex';

export function loadModules() {
    const modules = {};

    const files = import.meta.glob('./modules/([a-z_]+)(.store)?\\.js', { eager: true });

    for (const path in files) {
        const match = path.match(/([a-z_]+)(?:\.store)?\.js$/i);
        if (match) {
            const name = match[1];
            modules[`${name}Store`] = files[path].default;
        }
    }

    return { context: files, modules };
}


const { context, modules } = loadModules();
const store = new Vuex.Store({
    modules,
});

// if (module.hot) {
//     // Hot reload whenever any module changes.
//     module.hot.accept(context.id, () => {
//         const { modules } = loadModules();
//
//         store.hotUpdate({
//             modules,
//         });
//     });
// }

export default store;
