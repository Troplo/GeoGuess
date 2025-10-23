<template>
    <div class="d-flex flex-column align-center">
        <h2>{{ $t('Home.placeVisited', nbPlaceVisits) }}</h2>

        <div class="ga-2 d-flex flex-column align-center">
            <div class="d-flex ga-2">
                <geo-btn
                    rounded
                    color="secondary"
                    variant="tonal"
                    size="large"
                    @click="openDialog()"
                >
                    {{ $t('DialogRoom.singlePlayer') }}
                </geo-btn>

                <geo-btn
                    rounded
                    color="primary"
                    variant="tonal"
                    size="large"
                    :loading="!sessionStore.currentSession.playerId"
                    @click="openDialog(false)"
                >
                    {{ $t('DialogRoom.withFriends') }}
                </geo-btn>
            </div>
            <geo-btn
                class="search-box__btns__btn"
                rounded
                variant="tonal"
                color="gold"
                size="large"
                block
                :loading="!sessionStore.currentSession.playerId"
                @click="openDialog(false)"
            >
                {{ $t('DialogRoom.matchmaking') }}
            </geo-btn>
            <DialogRoom />
        </div>
        <div class="search-box__mapmenu">
            <geo-btn
                variant="text"
                class="btn-customs"
                color="primary"
                height="50"
                @click="dialogCustom = !dialogCustom"
            >
                <v-icon>mdi-map-plus</v-icon> {{ $t('Home.createMap') }}
            </geo-btn>
            <DialogCustomMap
                :visibility="dialogCustom"
                @change-visibility="changeDialogCustom"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/modernStores/game.store.js';
import DialogCustomMap from '@/components/home/DialogCustomMap.vue';
import DialogRoom from '@/components/dialogroom/DialogRoom.vue';
import { useSessionStore } from '@/modernStores/session.store.js';
import { useHomeStore } from '@/modernStores/home.store.js';

const props = defineProps({
    dialogCustomOpen: Boolean,
});

const dialogCustom = ref(false);

const gameStore = useGameStore();
const sessionStore = useSessionStore();

const router = useRouter();

const nbPlaceVisits = computed(() => homeStore.nbPlaceVisits);

watch(
    () => props.dialogCustomOpen,
    (val) => {
        dialogCustom.value = val;
    },
    { immediate: true }
);

const homeStore = useHomeStore();
onMounted(() => {
    homeStore.loadHistory();
});

function openDialog(isSinglePlayer) {
    gameStore.openDialogRoom(isSinglePlayer);
}

function changeDialogCustom() {
    dialogCustom.value = !dialogCustom.value;
    router.push(dialogCustom.value ? '/custom' : '/');
}
</script>
<style lang="scss">
.search-box {
    h2 {
        text-align: center;
    }

    .v-input {
        font-size: 1.2rem !important;
    }
    &__btns {
        margin-top: 1.125rem;
        display: flex;
        justify-content: space-around;
        width: calc(100% - 50px);
        &__btn {
            width: 40%;
            padding: 0 5em;
            font-size: 1.1rem;
        }
    }
    &__mapmenu {
        text-align: center;
        margin-top: 3rem;
    }
}
@media (max-width: 410px) {
    .search-box {
        .v-input {
            font-size: 1rem !important;
            width: 95% !important;
            margin: auto !important;
        }
        .search-box__btns {
        }
    }
}
</style>
