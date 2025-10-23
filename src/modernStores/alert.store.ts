import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAlertStore = defineStore('alert', () => {
    const alert = ref<
        | {
              title: string;
              subtitle?: string;
              color?: string;
              icon?: string;
          }
        | null
        | undefined
    >(undefined);

    function setAlert(newAlert?: string | null) {
        alert.value = newAlert;
    }

    return {
        alert,
        setAlert,
    };
});
