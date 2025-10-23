<template>
    <div
        id="container-map"
        :class="[
            ($viewport.width >= 450 && (activeMap || pinActive)) ||
            isMakeGuessButtonClicked ||
            isNextButtonVisible
                ? 'container-map--active'
                : '',
            printMapFull ? 'container-map--full' : '',
            `container-map--size-${size}`,
        ]"
        :style="{
            zIndex: printMapFull ? 99999 : undefined,
        }"
        @click.stop
        @mouseover="
            () => {
                if ($viewport.width >= 450) activeMap = true; // Only on tablet and desktop Issue #104
            }
        "
        @mouseleave="
            () => {
                if ($viewport.width >= 450) activeMap = false;
            }
        "
    >
        <div class="container-map_details">
            <div class="alert-container">
                <Leaderboard
                    style="top: 15px"
                    :leaderboard-shown="leaderboardShown"
                    :guess-string="guessString"
                    :current-round="gameStore.room?.currentRound"
                    :players="gameStore.players"
                    :owner-id="gameStore.room?.ownerPlayerId"
                ></Leaderboard>
            </div>
            <DetailsMap
                v-if="printMapFull"
                :properties="randomFeatureProperties"
            />
        </div>

        <div class="container-map_controls">
            <div class="container-map_btns">
                <geo-btn
                    size="x-small"
                    variant="tonal"
                    base-color="white"
                    icon
                    @click="showNotepad"
                >
                    <v-icon> mdi-file-document-edit </v-icon>
                </geo-btn>

                <geo-btn
                    id="btnDown"
                    variant="tonal"
                    icon
                    size="x-small"
                    base-color="white"
                    :disabled="size < 2"
                    @click="size--"
                >
                    <v-icon> mdi-arrow-bottom-left </v-icon>
                </geo-btn>

                <geo-btn
                    id="btnUp"
                    variant="tonal"
                    icon
                    size="x-small"
                    base-color="white"
                    :disabled="size > 3"
                    @click="size++"
                >
                    <v-icon> mdi-arrow-top-right </v-icon>
                </geo-btn>

                <geo-btn
                    id="btnPin"
                    variant="tonal"
                    icon
                    base-color="white"
                    size="x-small"
                    @click="pinActive = !pinActive"
                >
                    <v-icon> mdi-pin{{ pinActive ? '-off' : '' }} </v-icon>
                </geo-btn>
            </div>
        </div>
        <geo-btn
            v-if="
                $viewport.width < 450 &&
                !isGuessButtonClicked &&
                isMakeGuessButtonClicked
            "
            id="hide-map-button"
            size="x-small"
            color="red"
            @click="hideMap"
        >
            <v-icon color="white"> mdi-close </v-icon>
        </geo-btn>
        <Map
            v-if="mode === 'classic'"
            id="map"
            ref="mapRef"
            :bbox="bbox"
            @setSelectedPos="setSelectedPos"
        />
        <MapAreas
            v-if="mode !== 'classic'"
            id="map"
            ref="mapRef"
            :area="area"
            :areasGeoJsonUrl="areasGeoJsonUrl"
            :pathKey="pathKey"
            :bbox="bbox"
            :showFlag="mode === 'country'"
            @setSelectedPos="setSelectedPos"
        />
        <textarea
            class="container-map_notepad"
            v-show="isNotepadVisible"
            spellcheck="false"
            v-if="!printMapFull"
            ref="refNotepad"
        />
        <button
            v-if="
                !isNextButtonVisible &&
                !isSummaryButtonVisible &&
                ($viewport.width > 450 || isMakeGuessButtonClicked)
            "
            id="guess-button"
            :disabled="
                randomLatLng == null ||
                selectedPos == null ||
                isGuessButtonClicked ||
                (!!room && !isReady)
            "
            @click="selectLocation"
        >
            {{ $t('Maps.guess') }}
        </button>
        <button
            v-if="isNextButtonVisible"
            id="next-button"
            :disabled="!isNextButtonEnabled"
            :style="{
                backgroundColor: isNextButtonEnabled ? '#F44336' : '#B71C1C',
            }"
            @click="goToNextRound(false)"
        >
            {{ $t('Maps.nextRound') }}
        </button>
        <button
            v-if="isSummaryButtonVisible"
            id="summary-button"
            @click="dialogSummary = true"
        >
            {{ $t('Maps.viewSummary') }}
        </button>

        <button
            v-if="
                $viewport.width < 450 &&
                !isGuessButtonClicked &&
                !isMakeGuessButtonClicked &&
                !isNextButtonVisible
            "
            id="make-guess-button"
            class="bg-primary"
            @click="showMap"
        >
            {{ $t('Maps.makeGuess') }}
        </button>
        <DialogSummary
            :dialog-summary="dialogSummary"
            :summary-texts="summaryTexts"
            :score="score"
            :player-name="playerName"
            :points="points"
            :game="game"
            :multiplayer="!!room"
            :mapDetails="mapDetails"
            :nb-round="nbRound"
            @finishGame="finishGame"
            @playAgain="goToNextRound(true)"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import firebase from 'firebase/app';
import 'firebase/database';

import DialogSummary from '@/components/DialogSummary.vue';
import DetailsMap from '@/components/game/DetailsMap.vue';
import Map from '@/components/map/Map.vue';
import MapAreas from '@/components/map/MapAreas.vue';
import { GAME_MODE } from '@/constants';
import { getSelectedPos } from '@/utils';
import { getScore } from '@/utils/game/score';
import Leaderboard from '@/components/game/Leaderboard.vue';
import { useGameStore } from '@/modernStores/game.store.js';
import { useGameSocketStore } from '@/modernStores/socket.store.js';
import {
    GameSocketEventsServer,
    GameSocketServerEvent,
} from '@/geonext-server-types/types/socket/serverEvents.js';
import { RoomState } from '@/geonext-server-types/classes/rooms/Room.js';
import { useSessionStore } from '@/modernStores/session.store.js';

interface GameRound {
    guess?: LatLng;
    area?: string;
    position: LatLng;
    distance: number | null;
    points: number;
    timePassed: number;
}

interface SummaryText {
    playerName: string;
    finalScore: number;
    finalPoints: number;
}

interface Game {
    multiplayer: boolean;
    date: Date;
    rounds: GameRound[];
    timeLimitation?: number;
    difficulty?: string;
    mode?: string;
    timeAttack?: boolean;
    playerName?: string;
}

interface LatLng {
    lat: number;
    lng: number;
}

const props = defineProps<{
    randomLatLng: LatLng;
    randomFeatureProperties: Record<string, unknown>;
    roomName?: string;
    playerNumber: number;
    playerName: string;
    isReady: boolean;
    round: number;
    score: number;
    points: number;
    timeLimitation: number;
    difficulty: string;
    bbox: unknown;
    mode: string;
    area: string;
    timeAttack: boolean;
    nbRound: number;
    countdown: number;
    scoreMode: string;
    areasGeoJsonUrl: string;
    pathKey: string;
    mapDetails: Record<string, unknown>;
    scoreLeaderboard: unknown[];
    guessedLeaderboard: unknown[];
    leaderboardShown: boolean;
    guessString: string;
    multiplayer: boolean;
}>();

const emit = defineEmits<{
    printMapFull: [value: boolean];
    showResult: [];
    calculateDistance: [distance: number | null, points: number];
    goToNextRound: [isPlayAgain: boolean, incrementRound: boolean];
    finishGame: [];
    resetLocation: [];
}>();

const mapRef = ref<InstanceType<typeof Map>>();
const refNotepad = ref<HTMLTextAreaElement>();

const room = ref<firebase.database.Reference | null>(null);
const selectedPos = ref<LatLng | null>(null);
const distance = ref<number | null>(null);
const point = ref<number>(0);
const isGuessButtonClicked = ref(false);
const isMakeGuessButtonClicked = ref(false);
const isSelected = ref(false);
const isNextStreetViewReady = ref(false);
const isNextButtonVisible = ref(false);
const isSummaryButtonVisible = ref(false);
const dialogSummary = ref(false);
const activeMap = ref(false);
const size = ref(2);
const isNotepadVisible = ref(false);
const pinActive = ref(
    typeof localStorage !== 'undefined' &&
        localStorage.getItem('pinActive') === 'true'
);
const printMapFull = ref(false);
const countdownStarted = ref(false);
const startTime = ref<Date | null>(null);

const _game = ref<Game>({
    multiplayer: !!props.roomName,
    date: new Date(),
    rounds: [],
});

const sessionStore = useSessionStore();
const gameStore = useGameStore();

const game = computed({
    get: () => {
        if (!gameStore.room?.started) return _game.value;
        const room = gameStore.room;

        return {
            multiplayer: true,
            date: new Date(room.timerStart),
            roomName: room.name,
            version: 2,
            timeLimitation: 0,
            difficulty: room.config.difficulty,
            mode: room.config.modeSelected,
            timeAttack: room.config.timeAttackSelected,
            playerId: sessionStore.currentSession.playerId,
            // keep compatibility with v1
            playerName: sessionStore.currentSession.playerId,
            score: gameStore.currentDistanceScore,
            points: gameStore.currentPointsScore,
            rank: 1,
            nbRound: 5,
            rounds: room.rounds.map((round) => {
                const playersObj = {};
                room.players.forEach((player) => {
                    const playerRound = player.rounds.find(
                        (rnd) => rnd.round === round.round
                    );
                    if (!playerRound) {
                        playersObj[player.playerId] = {
                            playerName: player.player.name,
                            distance: -1,
                            latitude: round.latitude,
                            longitude: round.longitude,
                            points: 0,
                            timePassed: 0,
                            guess: {
                                lat: 0,
                                lng: 0,
                            },
                        };
                    } else {
                        playersObj[player.playerId] = {
                            playerName: player.player.name,
                            distance: playerRound.distance,
                            latitude: round.latitude,
                            longitude: round.longitude,
                            points: playerRound.points,
                            timePassed: playerRound.timePassed,
                            guess: {
                                lat: playerRound.latitude,
                                lng: playerRound.longitude,
                            },
                        };
                    }
                });
                return {
                    position: {
                        latitude: round.latitude,
                        longitude: round.longitude,
                        // coming soon to GeoNEXT
                        area: round.area ?? null,
                    },
                    players: playersObj,
                };
            }),
        };
    },
    set: (val) => {
        if (!gameStore.room?.started) _game.value = val;
    },
});

const summaryTexts = computed<SummaryText[]>(() => {
    if (!gameStore.ranks?.length) return [];
    return gameStore.ranks.map((rank) => {
        return {
            playerName: rank.name,
            finalScore: rank.totalScore,
            finalPoints: rank.totalPoints,
        };
    });
});

const gameSocketStore = useGameSocketStore();

// Computed
const isNextButtonEnabled = computed(() => {
    if (props.playerNumber === 1 || !room.value) {
        return true;
    }
    return isNextStreetViewReady.value;
});

// Watchers
watch(pinActive, (value) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pinActive', String(value));
    }
});

watch(printMapFull, (value) => {
    emit('printMapFull', value);
});

// Lifecycle
onMounted(async () => {
    if (mapRef.value) {
        await mapRef.value.$gmapApiPromiseLazy?.();
    }

    game.value.timeLimitation = props.timeLimitation;
    game.value.difficulty = props.difficulty;
    game.value.mode = props.mode;
    game.value.timeAttack = props.timeAttack;
    game.value.playerName = props.playerName;

    // Firebase setup commented out in original
    // if (props.roomName) {
    //   room.value = firebase.database().ref(props.roomName);
    //   room.value.on('value', (snapshot) => {
    //     // ... firebase logic
    //   });
    // }
});

const setSelectedPos = (pos: LatLng): void => {
    selectedPos.value = pos;
};

const showMap = (): void => {
    isMakeGuessButtonClicked.value = true;
};

const hideMap = (): void => {
    isMakeGuessButtonClicked.value = false;
};

const showNotepad = (): void => {
    isNotepadVisible.value = !isNotepadVisible.value;
    if (isNotepadVisible.value) {
        setTimeout(() => {
            refNotepad.value?.focus();
        });
    }
};

const calculateDistance = (): void => {
    const timePassed = startTime.value
        ? new Date().getTime() - startTime.value.getTime()
        : 0;

    if ([GAME_MODE.COUNTRY, GAME_MODE.CUSTOM_AREA].includes(props.mode)) {
        point.value = selectedPos.value === props.area ? 1 : 0;
        distance.value = null;
    } else {
        distance.value = Math.floor(
            google.maps.geometry.spherical.computeDistanceBetween(
                props.randomLatLng,
                selectedPos.value
            )
        );

        point.value = getScore(
            distance.value,
            props.difficulty,
            timePassed,
            props.scoreMode
        );
    }

    gameStore.commitGuess({
        ...getSelectedPos(selectedPos.value, props.mode),
        distance: distance.value,
        points: point.value,
        timePassed,
        round: props.round,
    });

    // Firebase update commented out in original
    // if (room.value) {
    //   room.value
    //     .child(`round${props.round}/player${props.playerNumber}`)
    //     .set({
    //       ...getSelectedPos(selectedPos.value, props.mode),
    //       distance: distance.value,
    //       points: point.value,
    //       timePassed,
    //     });
    // } else {
    game.value.rounds.push({
        guess: selectedPos.value ?? undefined,
        area: props.area,
        position: props.randomLatLng,
        distance: distance.value,
        points: point.value,
        timePassed,
    });
    // }

    emit('calculateDistance', distance.value, point.value);
};

const selectLocation = (): void => {
    calculateDistance();

    if (!props.multiplayer) {
        showRoundResults();
    }

    mapRef.value?.removeListener();
    isGuessButtonClicked.value = true;
    isSelected.value = true;
    isNextStreetViewReady.value = false;
};

const selectRandomLocation = (randomLatLng: LatLng): void => {
    if (selectedPos.value === null) {
        selectedPos.value = randomLatLng;
        mapRef.value?.removeMarkers();
        mapRef.value?.putMarker(selectedPos.value);
    }
    selectLocation();
};

const resetLocation = (): void => {
    emit('resetLocation');
};

const startNextRound = (): void => {
    mapRef.value?.startNextRound();
    startTime.value = new Date();
};

const goToNextRound = (isPlayAgain = false, incrementRound = true): void => {
    if (isPlayAgain) {
        dialogSummary.value = false;
        isSummaryButtonVisible.value = false;
    }

    selectedPos.value = null;
    isGuessButtonClicked.value = false;
    isSelected.value = false;
    isNextButtonVisible.value = false;
    countdownStarted.value = false;
    isNotepadVisible.value = false;

    if ((window as any).$viewport?.width < 450) {
        hideMap();
    }

    printMapFull.value = false;
    mapRef.value?.removeMarkers();
    mapRef.value?.removePolylines();
    mapRef.value?.centerOnBbox();

    emit('goToNextRound', isPlayAgain, incrementRound);
};

const finishGame = (): void => {
    dialogSummary.value = false;
    // Firebase update commented out in original
    // if (room.value) {
    //   room.value
    //     .child(`isGameDone/player${props.playerNumber}`)
    //     .set(true);
    // }
    emit('finishGame');
};

function setDialogSummary(val: boolean) {
    dialogSummary.value = val;
}

function showRoundResults() {
    if (!props.multiplayer) {
        const latLng = props.randomLatLng;
        mapRef.value!.putMarker(latLng, true);
        mapRef.value!.drawPolyline(selectedPos.value, 1, latLng);
        mapRef.value!.setInfoWindow(
            null,
            distance.value,
            point.value,
            false,
            setSelectedPos
        );

        printMapFull.value = true;
        mapRef.value!.fitBounds();

        if (props.round >= props.nbRound) {
            isSummaryButtonVisible.value = true;
        } else {
            isNextButtonVisible.value = true;
        }
        return;
    }

    const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    mapRef.value!.putMarker(props.randomLatLng, true);
    for (const player of gameStore.room.players) {
        const round = player.rounds.find((rnd) => rnd.round === props.round);
        if (!round) continue;

        const latLng = new google.maps.LatLng(round.latitude, round.longitude);
        mapRef.value!.putMarker(latLng, false);
        mapRef.value!.drawPolyline(latLng, 1, props.randomLatLng);
        mapRef.value!.setInfoWindow(
            player.player?.name || player.playerId,
            round.distance,
            round.points,
            false,
            setSelectedPos
        );

        bounds.extend(latLng);
    }

    printMapFull.value = true;
    mapRef.value!.fitBounds(bounds);

    if (props.round >= props.nbRound) {
        isSummaryButtonVisible.value = true;
    } else {
        isNextButtonVisible.value = true;
    }
}

defineExpose({
    startNextRound,
    selectRandomLocation,
    setDialogSummary,
    showRoundResults,
});
</script>

<style scoped lang="scss">
.alert-container {
    position: absolute;
    right: 0;
    .v-alert {
        z-index: 2;
    }
}

#container-map {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 5px;
    left: 10px;
    z-index: 3;
    opacity: 0.7;
    width: var(--width);
    height: var(--height);
    z-index: 3;
    --aspect-ratio: 1.25;
    --inactive-width: 16vw;
    --active-width: 30vw;
    --active-height: calc(var(--active-width) / var(--aspect-ratio));
    --inactive-height: calc(var(--inactive-width) / var(--aspect-ratio));
    --height: var(--inactive-height);
    --width: var(--inactive-width);
    max-width: 100%;
    max-height: calc(100% - 150px);
    transition: 0.3s;
    #map {
        width: 100%;
        height: 100%;
    }

    &.container-map--size-1 {
        --active-width: 16vw;
    }
    &.container-map--size-3 {
        --active-width: 45vw;
    }
    &.container-map--size-4 {
        --active-width: 65vw;
    }
    &.container-map--active {
        opacity: 1;
        --width: var(--active-width);
        --height: var(--active-height);
        .container-map_controls {
            display: flex;
        }
    }
    &.container-map--full {
        transition: none;
        opacity: 1;
        --active-width: 85vw;
        --inactive-width: 85vw;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: var(--active-width);
        height: auto;
        z-index: 999;
        margin: 0;

        .container-map_controls {
            display: none;
        }
        .container-map_details {
            display: block;
            position: relative;
        }
    }

    .container-map_details {
        display: none;
    }
    .container-map_controls {
        .container-map_btns {
            background-color: rgba(33, 33, 33);
            padding: 0.2rem;
            border-top-left-radius: 5%;
            border-top-right-radius: 5%;
        }
        button {
            width: 1.5rem;
            height: 1.5rem;
            margin: 0 0.5rem;
        }
        display: flex;
        flex-direction: row-reverse;
    }

    .container-map_notepad {
        position: absolute;
        background-color: rgb(var(--v-theme-notepad));
        resize: none;
        left: var(--width);
        margin-left: 10px;
        transition: 0.3s;
        width: 300px;
        height: calc(100% - 74px);
        top: 30px;
        border-radius: 3px;
        outline: none;
        padding: 5px;
        box-shadow: 0px 2px 8px 0px rgba(99, 99, 99, 0.2);
    }

    .theme--dark & .container-map_notepad {
        color: #fff;
    }
    .theme--light & .container-map_notepad {
        color: #000;
    }
}

#make-guess-button,
#guess-button,
#next-button,
#summary-button,
#reset-button,
#play-again-button {
    border: none;
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
    opacity: 0.8;
    color: white;
    font-size: 16px;
    text-decoration: none;
    text-align: center;
    padding: 10px 0;
    z-index: 999;
}

#reset-button {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 25%;
    background-color: #ff5e5e;
}

#next-button,
#summary-button:not(.w-50) {
    width: 100%;
}
button.w-50 {
    width: 50%;
}
#make-guess-button,
#guess-button {
    background-color: #212121;
}

#guess-button:hover,
#reset-button {
    opacity: 1;
}

#play-again-button {
    background-color: #43b581;
}

#next-button,
#summary-button {
    background-color: #f44336;
}

@media (max-width: 750px) {
    #container-map {
        --inactive-width: 25vw;

        &.container-map--size-1 {
            --active-width: 25vw;
        }
    }
}

@media (max-width: 450px) {
    #container-map {
        width: 100%;
        opacity: 1;
        height: auto;
        left: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        .container-map_controls {
            display: none;
        }
        .container-map_notepad {
            display: none;
        }
        #map {
            display: none;
        }
        &.container-map--active #map {
            display: block;
        }

        &.container-map--active .container-map_controls {
            display: none;
        }
        &.container-map--active {
            height: 40vh;
        }
        &.container-map--full {
            position: absolute;
            --width: 100%;
            height: calc(100% - 64px);
            bottom: 0;
            margin: 0;
            max-height: 100%;
        }
        .container-map_controls_guess {
            z-index: 999;
        }
    }

    #make-guess-button,
    #next-button,
    #reset-button,
    #guess-button,
    #summary-button {
        border-radius: 0;
        opacity: 1;
        bottom: 0;
        width: 100%;
    }

    #hide-map-button {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 4;
    }
}
</style>
