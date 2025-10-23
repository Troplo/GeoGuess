<template>
    <v-card id="card-settings" :disabled="loadingAreas" :loading="loadingAreas">
        <v-card-title>
            <p>{{ $t('CardRoomSettings.title') }}</p>
        </v-card-title>
        <v-card-text class="settings">
            <v-row>
                <v-col>
                    <v-row>
                        <label class="card_settings__mode__label">{{
                            $t('CardRoomSettings.modeLabel')
                        }}</label>
                        <v-row
                            class="card_settings__mode__btns d-flex justify-space-around w-100"
                        >
                            <geo-btn
                                id="modeClassicBtn"
                                :variant="
                                    gameSettings.modeSelected !==
                                    gameMode.CLASSIC
                                        ? 'text'
                                        : undefined
                                "
                                rounded
                                variant="outlined"
                                @click="
                                    () =>
                                        setGameSettings({
                                            modeSelected: gameMode.CLASSIC,
                                        })
                                "
                            >
                                <v-icon size="large"> mdi-map-marker </v-icon>
                                <span>{{ $t('modes.classic') }}</span>
                            </geo-btn>
                            <geo-btn
                                id="modeCountryBtn"
                                :variant="
                                    gameSettings.modeSelected !==
                                    gameMode.COUNTRY
                                        ? 'text'
                                        : undefined
                                "
                                rounded
                                variant="outlined"
                                @click="
                                    () =>
                                        setGameSettings({
                                            modeSelected: gameMode.COUNTRY,
                                        })
                                "
                            >
                                <v-icon size="large"> mdi-flag </v-icon>
                                <span>{{ $t('modes.country') }}</span>
                            </geo-btn>
                            <geo-btn
                                id="modeCustomAreaBtn"
                                v-if="
                                    gameSettings.modeSelected ===
                                    gameMode.CUSTOM_AREA
                                "
                                :variant="
                                    gameSettings.modeSelected !==
                                    gameMode.CUSTOM_AREA
                                        ? 'text'
                                        : undefined
                                "
                                rounded
                                variant="outlined"
                            >
                                <v-icon size="large">
                                    mdi-flag-checkered
                                </v-icon>
                                <span>{{ $t('modes.custom_area') }}</span>
                            </geo-btn>
                        </v-row>
                    </v-row>

                    <v-row class="mb-0">
                        <label class="card_settings__time__label">{{
                            $t('CardRoomTime.title')
                        }}</label>
                        <TimePicker
                            :value="gameSettings.time"
                            @input="(time) => setGameSettings({ time })"
                        />
                    </v-row>

                    <v-row
                        align="center"
                        class="d-flex justify-space-around flex-row mb-0 mt-0"
                    >
                        <v-col>
                            <v-checkbox
                                :model-value="gameSettings.zoomControl"
                                @update:model-value="
                                    (zoomControl) =>
                                        setGameSettings({ zoomControl })
                                "
                                :label="$t('CardRoomSettings.allowZoom')"
                                hide-details
                            />
                            <v-checkbox
                                :model-value="gameSettings.moveControl"
                                @update:model-value="
                                    (moveControl) =>
                                        setGameSettings({ moveControl })
                                "
                                :label="$t('CardRoomSettings.allowMove')"
                                hide-details
                            />
                            <v-checkbox
                                :model-value="gameSettings.panControl"
                                @update:model-value="
                                    (panControl) =>
                                        setGameSettings({ panControl })
                                "
                                :label="$t('CardRoomSettings.allowPan')"
                                hide-details
                            />
                            <v-checkbox
                                class="mt-2"
                                :model-value="gameSettings.allPanorama"
                                @update:model-value="
                                    (allPanorama) =>
                                        setGameSettings({ allPanorama })
                                "
                                :label="
                                    $t('CardRoomSettings.includePhotopheres')
                                "
                                hide-details
                            />
                            <v-checkbox
                                :model-value="gameSettings.optimiseStreetView"
                                @update:model-value="
                                    (optimiseStreetView) =>
                                        setGameSettings({ optimiseStreetView })
                                "
                                :label="
                                    $t('CardRoomSettings.optimiseStreetView')
                                "
                                hide-details
                            />
                            <br />
                            <v-checkbox
                                class="mt-2"
                                v-if="!singlePlayer"
                                :model-value="gameSettings.scoreLeaderboard"
                                @update:model-value="
                                    (scoreLeaderboard) =>
                                        setGameSettings({ scoreLeaderboard })
                                "
                                :label="$t('CardRoomSettings.scoreLeaderboard')"
                                hide-details
                            />
                            <v-checkbox
                                v-if="!singlePlayer"
                                :model-value="gameSettings.guessedLeaderboard"
                                @update:model-value="
                                    (guessedLeaderboard) =>
                                        setGameSettings({ guessedLeaderboard })
                                "
                                :label="
                                    $t('CardRoomSettings.guessedLeaderboard')
                                "
                                hide-details
                                :disabled="gameSettings.scoreLeaderboard"
                            />
                            <v-checkbox
                                :model-value="gameSettings.allowReRoll"
                                @update:model-value="
                                    (allowReRoll) =>
                                        setGameSettings({ allowReRoll })
                                "
                                :label="$t('CardRoomSettings.allowReRoll')"
                                hide-details
                            />
                        </v-col>
                        <v-col>
                            <v-text-field
                                v-if="!singlePlayer"
                                :label="$t('CardRoomSettings.countDownLabel')"
                                :model-value="gameSettings.countdown"
                                @update:model-value="
                                    (countdown) =>
                                        setGameSettings({
                                            countdown: +countdown,
                                        })
                                "
                                hide-details
                                type="number"
                            />
                            <div
                                v-if="
                                    gameSettings.modeSelected !==
                                        gameMode.CLASSIC && !singlePlayer
                                "
                            >
                                <v-checkbox
                                    :model-value="
                                        gameSettings.timeAttackSelected
                                    "
                                    @update:model-value="
                                        (timeAttackSelected) =>
                                            setGameSettings({
                                                timeAttackSelected,
                                            })
                                    "
                                    hide-details
                                >
                                    <template #label>
                                        {{
                                            $t(
                                                'CardRoomSettings.timeAttackLabel'
                                            )
                                        }}
                                        <v-tooltip
                                            location="top"
                                            max-width="350"
                                            class="tooltip-timeattack"
                                        >
                                            <template
                                                v-slot:activator="{ props }"
                                            >
                                                <geo-btn icon v-bind="props">
                                                    <v-icon>
                                                        mdi-information
                                                    </v-icon>
                                                </geo-btn>
                                            </template>
                                            <span>{{
                                                $t(
                                                    'CardRoomSettings.timeattackInfos'
                                                )
                                            }}</span>
                                        </v-tooltip>
                                    </template>
                                </v-checkbox>
                            </div>
                            <v-expansion-panels
                                prepend-icon="mdi-cog"
                                color="toolbar"
                                class="mt-4"
                            >
                                <v-expansion-panel>
                                    <v-expansion-panel-title>
                                        More Settings
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        <v-text-field
                                            class="mt-2"
                                            type="number"
                                            :disabled="
                                                gameSettings.timeAttackSelected
                                            "
                                            :label="
                                                $t('CardRoomSettings.nbRound')
                                            "
                                            :model-value="
                                                gameSettings.timeAttackSelected
                                                    ? 10
                                                    : gameSettings.nbRoundSelected
                                            "
                                            min="1"
                                            @update:model-value="
                                                (nbRoundSelected) =>
                                                    setGameSettings({
                                                        nbRoundSelected:
                                                            +nbRoundSelected,
                                                    })
                                            "
                                        />
                                        <v-select
                                            v-if="
                                                gameSettings.modeSelected ===
                                                gameMode.CLASSIC
                                            "
                                            :label="
                                                $t(
                                                    'CardRoomSettings.scoreModeLabel'
                                                )
                                            "
                                            :model-value="
                                                gameSettings.scoreMode
                                            "
                                            :items="scoreModes"
                                            @update:model-value="
                                                (scoreMode) =>
                                                    setGameSettings({
                                                        scoreMode,
                                                    })
                                            "
                                            item-key="value"
                                            item-title="text"
                                        />

                                        <v-autocomplete
                                            v-if="optionsArea.length > 0"
                                            :label="
                                                $t(
                                                    'CardRoomSettings.selectAreas'
                                                )
                                            "
                                            :model-value="
                                                gameSettings.areaParams
                                            "
                                            :items="optionsArea"
                                            @update:model-value="
                                                (areaParams) =>
                                                    setGameSettings({
                                                        areaParams,
                                                    })
                                            "
                                            item-key="value"
                                            item-title="text"
                                        />
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <geo-btn variant="tonal" color="error" @click="$emit('cancel')">
                {{ $t('cancel') }}
            </geo-btn>
            <geo-btn
                id="btnNextSettings"
                variant="tonal"
                color="#43B581"
                @click="onClickNext"
            >
                {{ $t('next') }}
            </geo-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useGameStore } from '@/modernStores/game.store.js';
import TimePicker from '@/components/shared/TimePicker.vue';
import { GAME_MODE, SCORE_MODE } from '@/constants';
import CardRoomMixin from './mixins/CardRoomMixin';
import bbox from '@turf/bbox';
import { useI18n } from 'vue-i18n';

// Pinia store for settings
const gameStore = useGameStore();

// Vuex store
const store = useStore();

// Props
defineProps<{ singlePlayer?: boolean }>();

// Reactive state
const invalidAreas = ref(false);
const loadingAreas = ref(false);

// Computed
const areasJson = computed(() => store.getters.areasJson);
const areasList = computed(() => store.getters.areasList);
const placeGeoJson = computed(() => store.state.homeStore.map.geojson);
const gameSettings = computed(() => gameStore.gameSettings);

const { t } = useI18n();

const optionsArea = computed(() => {
    return [
        { text: t('unspecified'), value: null },
        ...areasList.value
            .filter((a: any) => {
                if (!a.data.bbox) return true;
                if (placeGeoJson.value) {
                    const bboxPlace = bbox(placeGeoJson.value);
                    return a.data.bbox.every((v: number, index: number) =>
                        index < 2
                            ? v <= bboxPlace[index]
                            : v >= bboxPlace[index]
                    );
                }
                return false;
            })
            .map((a: any) => ({ text: a.nameLocate, value: a })),
    ];
});

const scoreModes = computed(() =>
    Object.values(SCORE_MODE).map((mode) => ({
        value: mode,
        text: t('CardRoomSettings.scoreModes.' + mode) || mode,
    }))
);

const gameMode = computed(() => GAME_MODE);

// Methods
function setGameSettings(settings: any) {
    gameStore.gameSettings = {
        ...gameStore.gameSettings,
        ...settings,
    };
}

function setSettings() {
    setGameSettings({});
    gameStore.saveSettings();
}

function onClickNext() {
    setSettings();
}

CardRoomMixin;
</script>

<style lang="scss" scoped>
#card-settings {
    &.blur {
        filter: blur(1px);
    }
    .card_settings__readonly {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }
    .settings .row {
        margin-bottom: 1.5rem;
        .v-select {
            width: 15.5rem;
        }
    }

    .v-input {
        align-self: start;
        margin: 0;
        .v-messages {
            display: contents;
        }
    }

    @media (max-width: 360px) {
        .card_settings__mode__btns {
            flex-direction: column;
            margin-top: 2rem;
            .v-btn {
                margin: 5px 0;
                width: 100%;
            }
        }
    }
}
</style>
