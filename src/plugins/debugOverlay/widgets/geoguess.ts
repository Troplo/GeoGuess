import { registerWidget } from '@troplo/debug-overlay';
import { defineComponent, h } from 'vue';
import DevWidgetSocket from './socket/DevWidgetSocket.vue';

const quickStart = defineComponent({
    mounted() {
        this.$game.singleplayer = false;
        this.$game.isOpenDialogRoom = true;
        this.$game.currentComponent = 'playerName';
        this.$game.searchRoom(crypto.randomUUID());
        this.$game.startGame();
    },
});

const quickStartMp = defineComponent({
    props: {
        count: {
            type: Number,
            default: 1,
        },
    },
    async mounted() {
        this.$game.singleplayer = false;
        this.$game.isOpenDialogRoom = true;
        this.$game.currentComponent = 'playerName';
        const rid = crypto.randomUUID();
        this.$game.searchRoom(rid);
    },
    watch: {
        '$game.room.name'() {
            for (let i = 0; i < this.count; i++) {
                const newWindow = window.open(
                    `http://localhost:8080/room/${this.$game.room.name}?name=${
                        crypto.randomUUID().split('-')[0]
                    }`,
                    '_blank'
                );
                window.focus();
            }
        },
    },
});

export function registerGeoGuessWidgets() {
    registerWidget({
        title: 'Quick Start SPinMP',
        shortcut: ['F1'],
        component: h(quickStart),
        category: 'Quick Start',
    });
    registerWidget({
        title: 'Quick Start MP 2 Player',
        shortcut: ['F2'],
        component: h(quickStartMp),
        category: 'Quick Start',
    });
    registerWidget({
        title: 'Quick Start MP 4 Player',
        shortcut: ['F4'],
        category: 'Quick Start',
        component: h(
            quickStartMp,
            {
                count: 3,
            },
            []
        ),
    });

    registerWidget({
        title: 'Socket Network Options',
        category: 'Socket',
        component: h(DevWidgetSocket),
    });

    registerWidget({
        title: 'HTTP Network Inspector',
        category: 'Network',
        component: h(DevWidgetSocket),
    });

    registerWidget({
        title: 'Socket Network Inspector',
        category: 'Network',
        component: h(DevWidgetSocket),
    });
}
