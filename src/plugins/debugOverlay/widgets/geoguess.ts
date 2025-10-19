import { registerWidget } from '@troplo/debug-overlay';
import { defineComponent, h } from 'vue';

const quickStart = defineComponent({
    mounted() {
        this.$game.singleplayer = false;
        this.$game.isOpenDialogRoom = true;
        this.$game.currentComponent = 'playerName';
        this.$game.searchRoom(crypto.randomUUID());
        this.$game.startGame();
    },
});

export function registerGeoGuessWidgets() {
    registerWidget({
        title: 'Quick Start MP',
        shortcut: ['CTRL', 'ALT', 'P'],
        component: h(quickStart),
    });
}
