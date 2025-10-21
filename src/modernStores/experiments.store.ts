// Utilities
import { defineStore } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import geonextAxios from '../plugins/geonextAxios.js';

export interface ExperimentsState {
    experiments: Record<string, string | number | boolean | object>;
    experimentsInherit: Record<string, string | number | boolean | object>;
}

export const useExperimentsStore = defineStore('experiments', () => {
    const experiments = ref<Record<string, number | object>>({
        // Synced from the server
    } as any);
    const experimentsInherit = ref<Record<string, number | boolean | object>>(
        {}
    );

    watch(
        () => experiments.value.DISABLE_ANIMATIONS,
        (value) => {
            if (value) {
                document.body.classList.add('disable-animations');
            } else {
                document.body.classList.remove('disable-animations');
            }
        }
    );

    async function init() {
        let localExperiments: any = localStorage.getItem('experimentsStore');
        if (localExperiments) {
            try {
                localExperiments = JSON.parse(localExperiments);
                for (const experiment of localExperiments) {
                    experiments.value[experiment.id] = experiment.value;
                }
            } catch {
                //
            }
        }

        const { data } = await geonextAxios.get('/core/experiments');
        for (const [key, value] of Object.entries(data)) {
            experiments.value[key as string] = value;
        }
        localStorage.setItem(
            'experimentsStore',
            JSON.stringify(experiments.value)
        );
    }

    return {
        experiments,
        init,
        experimentsInherit,
    };
});
