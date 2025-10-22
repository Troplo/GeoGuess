<template>
    <div>
        <div id="game-page">
            <div id="street-view-container">
                <HeaderGame
                    ref="header"
                    :distance="scoreHeader"
                    :points="pointsHeader"
                    :round="round"
                    :room-name="roomName"
                    :nb-round="nbRound"
                    :remaining-time="remainingTime"
                    :mode="mode"
                    :multiplayer="multiplayer"
                    :re-roll-game="reRollGame"
                    :re-roll-voted="reRollVoted"
                    :player-count="gameStore.players?.length"
                    :voted-count="votedCount"
                    :allow-re-roll="allowReRoll"
                    :guess-string="guessString"
                    :leaderboard-shown="leaderboardShown"
                    :started-at="startedAt"
                />

                <div id="game-interface">
                    <v-overlay
                        :model-value="!isReady && multiplayer"
                        opacity="1"
                    />
                    <div id="street-view" ref="streetView" />
                    <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                            <geo-btn
                                class="resetBtn"
                                icon
                                v-bind="props"
                                @click="resetLocation"
                            >
                                <v-icon>mdi-crosshairs-gps</v-icon>
                            </geo-btn>
                        </template>
                        <span>{{ $t('Maps.reset') }}</span>
                    </v-tooltip>
                    <Maps
                        ref="mapContainer"
                        :random-lat-lng="trueLatLng"
                        :random-feature-properties="randomFeatureProperties"
                        :room-name="roomName"
                        :player-number="playerNumber"
                        :player-name="playerName"
                        :is-ready="isReady"
                        :round="round"
                        :multiplayer="multiplayer"
                        :score="score"
                        :points="points"
                        :difficulty="difficultyData"
                        :time-limitation="timeLimitation"
                        :bbox="bbox"
                        :mode="mode"
                        :area="area"
                        :time-attack="timeAttack"
                        :nb-round="nbRound"
                        :countdown="countdown"
                        :score-mode="scoreMode"
                        :areasGeoJsonUrl="areaParams && areaParams.data.urlArea"
                        :pathKey="
                            areaParams ? areaParams.data.pathKey : 'iso_a2'
                        "
                        :mapDetails="mapDetails"
                        :score-leaderboard="scoreLeaderboard"
                        :guessed-leaderboard="guessedLeaderboard"
                        :guess-string="guessString"
                        :leaderboard-shown="leaderboardShown"
                        @resetLocation="resetLocation"
                        @calculateDistance="updateScore"
                        @showResult="showResult"
                        @goToNextRound="goToNextRound"
                        @finishGame="finishGame"
                        @printMapFull="printMapFull = $event"
                    />
                </div>
            </div>
        </div>
        <v-overlay
            persistent
            :model-value="overlay"
            opacity="0.8"
            z-index="1"
        />
        <DialogMessage
            :dialog-message="dialogMessage"
            :dialog-title="dialogTitle"
            :dialog-text="dialogText"
        />
        <div class="alert-container">
            <Leaderboard
                style="top: 79px"
                :guess-string="guessString"
                :leaderboard-shown="leaderboardShown"
                :current-round="gameStore.room?.currentRound"
                :players="gameStore.players"
                :owner-id="gameStore.room?.ownerPlayerId"
                v-if="!printMapFull && props.multiplayer"
            ></Leaderboard>
            <v-alert
                id="leaderboard-alert"
                icon="mdi-scoreboard-outline"
                width="400"
                class="mt-2 mr-2"
                v-if="
                    guessString &&
                    !$vuetify.breakpoint.mobile &&
                    leaderboardShown
                "
            >
                {{ guessString }}
            </v-alert>
            <v-alert
                v-if="isVisibleDialog"
                type="warning"
                closable
                class="warning-alert"
            >
                <b>{{ $t('StreetView.nearby.title') }}</b> :
                {{ $t('StreetView.nearby.message') }}
            </v-alert>
            <v-alert
                id="warningCountdown"
                v-model="isVisibleCountdownAlert"
                type="info"
                closable
                standard-easing
                prominent
                icon="mdi-clock-fast"
            >
                {{ $tc('StreetView.countdownAlert', remainingTime) }}
                <v-progress-linear
                    :active="isVisibleCountdownAlert"
                    color="white"
                    v-model="countdownPercentage"
                    absolute
                    location="bottom"
                ></v-progress-linear>
            </v-alert>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import 'firebase/database';

import HeaderGame from '@/components/HeaderGame.vue';
import Maps from '@/components/Maps.vue';
import DialogMessage from '@/components/DialogMessage.vue';
import Leaderboard from '@/components/game/Leaderboard.vue';

import StreetViewService from '@/plugins/StreetViewService';
import { useGameStore } from '@/modernStores/game.store.js';
import { getRandomArea } from '@/utils';
import { GAME_MODE, SCORE_MODE } from '@/constants';
import { GameSocketClientEvent } from '@/geonext-server-types/types/socket/clientEvents.js';
import { useGameSocketStore } from '@/modernStores/socket.store.js';
import {
    GameSocketEventsServer,
    GameSocketServerEvent,
} from '@/geonext-server-types/types/socket/serverEvents.js';
import { RoomState, Round } from '@/geonext-server-types/classes/rooms/Room';

interface LeaderboardEntry {
    scoreHeader?: number;
    score?: number;
    name: string;
    id: string;
    guessed?: boolean;
}

const props = withDefaults(
    defineProps<{
        roomName?: string | null;
        allPanorama?: boolean;
        optimiseStreetView?: boolean;
        playerNumber?: number | null;
        playerName?: string | null;
        placeGeoJson?: object | null;
        multiplayer?: boolean;
        time?: number;
        difficulty?: number;
        bboxObj?: any[] | null;
        roundsPredefined?: any[] | null;
        modeSelected?: string;
        panControl?: boolean;
        zoomControl?: boolean;
        moveControl?: boolean;
        timeAttackSelected?: boolean;
        countdown?: number;
        scoreMode?: string;
        areaParams?: object;
        mapDetails?: object | undefined;
        nbRoundSelected?: number;
        allowReRoll?: boolean;
        guessedLeaderboard?: boolean;
        scoreLeaderboard?: boolean;
    }>(),
    {
        roomName: null,
        allPanorama: false,
        optimiseStreetView: true,
        playerNumber: null,
        playerName: null,
        placeGeoJson: null,
        multiplayer: false,
        time: 0,
        difficulty: 2000,
        bboxObj: null,
        roundsPredefined: null,
        modeSelected: GAME_MODE.CLASSIC,
        panControl: true,
        zoomControl: true,
        moveControl: true,
        timeAttackSelected: false,
        countdown: 0,
        scoreMode: SCORE_MODE.NORMAL,
        areaParams: undefined,
        mapDetails: undefined,
        nbRoundSelected: 5,
        allowReRoll: true,
        guessedLeaderboard: true,
        scoreLeaderboard: true,
    }
);

const router = useRouter();
const { t } = useI18n();
const vuexStore = useStore();
const gameStore = useGameStore();

// Template refs
const streetView = ref<HTMLElement>();
const mapContainer = ref<InstanceType<typeof Maps>>();
const header = ref<InstanceType<typeof HeaderGame>>();

// Data
const area = ref<string | null>(null);
const randomLatLng = ref<google.maps.LatLng | null>(null);
const randomFeatureProperties = ref<any>(null);
const score = ref(0);
const scoreHeader = ref(0);
const points = ref(0);
const pointsHeader = ref(0);
const round = ref(1);
const timeLimitation = ref(props.time);
const mode = ref(props.modeSelected);
const timeAttack = ref(props.timeAttackSelected);
const nbRound = ref(props.timeAttackSelected ? 10 : props.nbRoundSelected);
const remainingTime = ref(0);
const endTime = ref<Date | null>(null);
const hasTimerStarted = ref(false);
const hasLocationSelected = ref(false);
const overlay = ref(false);
const room = ref<any>(null);
const isReady = ref(false);
const dialogMessage = ref(props.multiplayer);
const dialogTitle = ref(t('StreetView.waitForOtherPlayers'));
const dialogText = ref('');
const isVisibleDialog = ref(false);
const panorama = ref<google.maps.StreetViewPanorama | null>(null);
const difficultyData = ref(props.difficulty);
const bbox = ref(props.bboxObj);
const isVisibleCountdownAlert = ref(false);
const timeCountdown = ref(0);
const streetViewService = ref<StreetViewService | null>(null);
const lngLat = ref<string | null>(null);
const leaderboard = ref<LeaderboardEntry[]>([]);
const leaderboardShown = ref(
    props.guessedLeaderboard || props.scoreLeaderboard
);
const printMapFull = ref(false);
const isDev = ref(false);
const timerInProgress = ref(false);
const canExit = ref(false);

// Computed
const areasJson = computed(() => vuexStore.getters.areasJson);
const players = computed(() => vuexStore.state.settingsStore.players);

const startedAt = computed(() => {
    return (
        gameStore.room.rounds.find(
            (rnd) => rnd.round === gameStore.room.currentRound
        )?.timerStart || new Date().getTime()
    );
});

const guessString = computed(() => {
    if (!leaderboardShown.value) return '';
    if (props.scoreLeaderboard) {
        return Object.entries(leaderboard.value)
            .sort(([, a]: any, [, b]: any) => b.score - a.score)
            .map(
                ([, player]: any) =>
                    `${player.name}: ${
                        player.guessed
                            ? t('Maps.leaderboard.guessed')
                            : t('Maps.leaderboard.notGuessed')
                    } / ${player.scoreHeader || 0}`
            )
            .join('\n');
    } else {
        return Object.entries(leaderboard.value)
            .sort(([, a]: any, [, b]: any) => b.guessed - a.guessed)
            .map(
                ([, player]: any) =>
                    `${player.name}: ${
                        player.guessed
                            ? t('Maps.leaderboard.guessed')
                            : t('Maps.leaderboard.notGuessed')
                    }`
            )
            .join('\n');
    }
});

const countdownPercentage = computed(() => {
    return (remainingTime.value * 100) / timeCountdown.value;
});

const reRollVoted = computed<boolean>(() => {
    return gameStore.currentRoomRound?.votedReRoll ?? false;
});

// Methods
const loadAreas = async (urlArea?: string) => {
    await vuexStore.dispatch('loadAreas', urlArea);
};

async function reRollGame() {
    if (!props.allowReRoll) return;
    if (props.multiplayer) {
        gameSocketStore.emit(GameSocketClientEvent.GAME_VOTE_TO_REROLL, {
            round: round.value,
        });
    }
}

const votedCount = computed(() => {
    const room = gameStore.room;
    console.log(room);
    if (!room?.players?.length) return 0;
    console.log(room, room.players.length, 292002);

    return room.players.reduce((count, player) => {
        const currentRound = player.rounds?.find(
            (r) => r.round === round.value
        );
        console.log(currentRound, 'deez');
        if (currentRound?.votedReRoll) count++;
        return count;
    }, 0);
});

async function loadStreetView() {
    // if (!props.multiplayer && timeLimitation.value !== 0) {
    //     initTimer(timeLimitation.value);
    // }

    const {
        panorama: panoData,
        roundInfo,
        warning,
        area: areaData,
    } = await streetViewService.value!.getStreetView(round.value);
    randomLatLng.value = panoData.location.latLng;
    randomFeatureProperties.value = roundInfo;
    area.value = areaData;
    setPosition(panoData);

    if (props.multiplayer) {
        await useGameSocketStore().emit(
            GameSocketClientEvent.GAME_POPULATE_ROUND_INFO,
            {
                latitude: randomLatLng.value.lat(),
                longitude: randomLatLng.value.lng(),
                round: round.value,
                ...roundInfo,
                ...(areaData && { area: areaData }),
                warning,
            }
        );
    }
    devScan();
}

function devScan() {
    document.querySelectorAll('*').forEach((el) => {
        const directText = Array.from(el.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim())
            .join('');

        if (directText === 'For development purposes only') {
            (el as HTMLElement).style.display = 'none';
        }

        if (directText === "This page can't load Google Maps correctly.") {
            console.log("This page can't load Google Maps correctly.");
            const secondParent = el.parentElement?.parentElement;
            if (secondParent) secondParent.style.display = 'none';
            if (streetView.value) streetView.value.style.filter = 'invert(99%)';
        }
    });
}

const trueLatLng = computed(() => {
    if (!props.multiplayer) {
        return randomLatLng.value;
    }
    const round = gameStore.room?.rounds.find(
        (rnd) => rnd.round === gameStore.room.currentRound
    );
    console.log(
        'deezer',
        google,
        round,
        gameStore.room?.rounds,
        gameStore.room.currentRound
    );
    if (!google || !round) return;
    const latLng = new google.maps.LatLng(round.latitude, round.longitude);
    console.log(latLng, 'LATLNG');
    return latLng;
});

function resetLocation() {
    if (!randomLatLng.value) return;
    const service = new google.maps.StreetViewService();
    service.getPanorama(
        {
            location: randomLatLng.value,
            preference: 'nearest',
            radius: 50,
            source: props.allPanorama ? 'default' : 'outdoor',
        },
        setPosition
    );
}

function setPosition(data: any) {
    if (!panorama.value) return;

    panorama.value.setOptions({
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        showRoadLabels: false,
        panControl: props.panControl,
        zoomControl: props.zoomControl,
        scrollwheel: props.zoomControl,
        disableDoubleClickZoom: !props.zoomControl,
        linksControl: props.moveControl,
        clickToGo: props.moveControl,
    });

    // Remove google streetview link
    const streetViewLink = document.querySelector(
        '#street-view a[href^="https://maps"]'
    );
    if (streetViewLink) streetViewLink.remove();

    setTimeout(() => {
        const widgetScene = document.querySelector('.widget-scene');
        if (widgetScene) {
            widgetScene.addEventListener('keydown', onUserEventPanoramaKey);
            widgetScene.addEventListener('mousedown', onUserEventPanoramaMouse);
            widgetScene.addEventListener(
                'touchstart',
                onUserEventPanoramaMouse
            );
            widgetScene.addEventListener(
                'pointerdown',
                onUserEventPanoramaMouse
            );
        }
    }, 50);

    try {
        if (data?.location) {
            const streetViewPanorama = new google.maps.StreetViewPanorama(
                streetView.value!
            );
            streetViewPanorama.setOptions({
                addressControl: false,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                showRoadLabels: false,
                panControl: props.panControl,
                zoomControl: props.zoomControl,
                scrollwheel: props.zoomControl,
                disableDoubleClickZoom: !props.zoomControl,
                linksControl: props.moveControl,
                clickToGo: props.moveControl,
            });
            streetViewPanorama.setPano(data.location.pano);
            streetViewPanorama.setPov({
                heading: 270,
                pitch: 0,
            });
            streetViewPanorama.setZoom(0);
        }
    } catch (e) {
        console.error(e);
    }

    devScan();
}

function initTimer(time: number, printAlert?: boolean) {
    const endDate = new Date();
    endDate.setSeconds(endDate.getSeconds() + time);
    if (printAlert) {
        timeCountdown.value = time;
        isVisibleCountdownAlert.value = true;
    }
    if (hasTimerStarted.value) {
        endTime.value =
            endTime.value && endTime.value > endDate ? endDate : endTime.value;
    } else {
        endTime.value = endDate;
        startTimer();
    }
}

function startTimer(roundNum = round.value) {
    if (roundNum === round.value) {
        remainingTime.value = Math.max(
            0,
            Math.round((endTime.value!.getTime() - Date.now()) / 1000)
        );
        if (remainingTime.value > 0) {
            setTimeout(() => {
                startTimer(roundNum);
            }, 1000);
        } else {
            timerInProgress.value = false;
            if (!hasLocationSelected.value) {
                if (
                    [GAME_MODE.COUNTRY, GAME_MODE.CUSTOM_AREA].includes(
                        mode.value
                    )
                ) {
                    mapContainer.value?.selectRandomLocation(
                        getRandomArea(
                            areasJson.value,
                            props.areaParams?.data?.pathKey || 'iso_a2'
                        )
                    );
                } else {
                    mapContainer.value?.selectRandomLocation(
                        streetViewService.value!.getRandomLatLng().position
                    );
                }
            }
        }
    }
}

function updateScore(distance: number, _points: number) {
    hasLocationSelected.value = true;
    if (!props.multiplayer) {
        remainingTime.value = 0;
    }
    score.value += distance;
    points.value += _points;

    // if (props.multiplayer) {
    // room.value
    //     .child('finalScore/player' + props.playerNumber)
    //     .set(score.value);
    // room.value
    //     .child('finalPoints/player' + props.playerNumber)
    //     .set(points.value);

    if (props.multiplayer) {
        dialogTitle.value = t('StreetView.waitForOtherPlayers');
        dialogMessage.value = true;
    } else {
        showResult();
    }
    // }
}

function showResult() {
    scoreHeader.value = score.value;
    pointsHeader.value = points.value;
    remainingTime.value = 0;
    dialogMessage.value = false;
    isVisibleCountdownAlert.value = false;
    overlay.value = true;
    header.value?.stopTimer();
    mapContainer.value.showRoundResults();

    for (const player of Object.values(leaderboard.value)) {
        player.scoreHeader = player.score;
    }
}

async function goToNextRound(playAgain = false, incrementRound = true) {
    if (playAgain) {
        round.value = 0;
        scoreHeader.value = 0;
        pointsHeader.value = 0;
        score.value = 0;
        points.value = 0;
    }

    randomLatLng.value = null;
    area.value = null;
    overlay.value = false;
    hasTimerStarted.value = false;
    hasLocationSelected.value = false;
    isVisibleDialog.value = false;
    randomFeatureProperties.value = null;

    if (props.multiplayer) {
        dialogMessage.value = true;
        isReady.value = false;
    }

    if (incrementRound) round.value += 1;

    if (!props.multiplayer) {
        await loadStreetView();
    }
    mapContainer.value?.startNextRound();

    gameSocketStore.emit(GameSocketClientEvent.GAME_READY_TO_CONTINUE, {
        nextRound: round.value,
    });
}

function exitGame() {
    dialogTitle.value = t('StreetView.redirectToHomePage');
    dialogText.value = t('StreetView.exitGame');
    dialogMessage.value = true;
    canExit.value = true;
    router.push('/history');
}

function finishGame() {
    canExit.value = true;
    if (!props.multiplayer) {
        router.push('/history');
    } else {
        dialogTitle.value = t('StreetView.waitForOtherPlayersToFinish');
        dialogText.value = '';
        dialogMessage.value = true;
        gameSocketStore.emit(GameSocketClientEvent.GAME_READY_TO_LEAVE, {});
    }
}

function onUserEventPanoramaKey(e: KeyboardEvent) {
    if (
        (!props.moveControl && [38, 40, 87, 83, 90].includes(e.keyCode)) ||
        (!props.zoomControl && [107, 109, 187, 189].includes(e.keyCode)) ||
        (!props.panControl && [37, 39, 65, 68, 100, 102].includes(e.keyCode))
    ) {
        e.stopPropagation();
    }
}

function onUserEventPanoramaMouse(e: MouseEvent | TouchEvent | PointerEvent) {
    if (!props.panControl) e.stopPropagation();
}

// MODERN EVENTS
const gameSocketStore = useGameSocketStore();
function onNewRound(data: Round) {
    lngLat.value = `${data.longitude},${data.latitude}`;
    randomLatLng.value = new google.maps.LatLng(data.latitude, data.longitude);
    round.value = data.round;
    isReady.value = true;
    dialogMessage.value = false;
    dialogTitle.value = '';
    mapContainer.value?.startNextRound();

    resetLocation();

    // server authoritative stats
    console.log('Current room round', gameStore.currentRoomRound);
    score.value = gameStore.currentDistanceScore;
    scoreHeader.value = gameStore.currentDistanceScore;
    points.value = gameStore.currentPointsScore;
    pointsHeader.value = gameStore.currentPointsScore;
}
let rndUnregister: null;
let exitUnregister: null;
let gameStateUpdateUnregister = null;
let requestStreetViewUnregister = null;
function onGameStateUpdate(
    data: GameSocketEventsServer[GameSocketServerEvent.GAME_STATE_UPDATED]
) {
    if (data.state === RoomState.ROUND_FINISHED && data.round === round.value) {
        showResult();
    }
}
function registerGeoNextEvents() {
    gameStateUpdateUnregister = gameSocketStore.on(
        GameSocketServerEvent.GAME_STATE_UPDATED,
        onGameStateUpdate
    );
    rndUnregister = gameSocketStore.on(
        GameSocketServerEvent.GAME_NEW_ROUND,
        onNewRound
    );
    exitUnregister = gameSocketStore.on(
        GameSocketServerEvent.GAME_FINISHED,
        exitGame
    );
    requestStreetViewUnregister = gameSocketStore.on(
        GameSocketServerEvent.GAME_REQUEST_STREET_VIEW_POPULATE,
        (
            data: GameSocketEventsServer[GameSocketServerEvent.GAME_REQUEST_STREET_VIEW_POPULATE]
        ) => {
            if (data.round === round.value) {
                loadStreetView();
            }
        }
    );

    gameSocketStore.emit(GameSocketClientEvent.GAME_READY, {});
}

function waitForGoogle() {
    return new Promise(function (resolve) {
        function check() {
            if (window.google) {
                resolve(window.google);
            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    });
}

onMounted(async () => {
    if (props.areaParams?.data?.urlArea || mode.value === GAME_MODE.COUNTRY) {
        await loadAreas(props.areaParams?.data?.urlArea);
    }

    await waitForGoogle();
    panorama.value = new google.maps.StreetViewPanorama(streetView.value!);

    if (!streetViewService.value) {
        streetViewService.value = new StreetViewService(
            {
                allPanorama: props.allPanorama,
                optimiseStreetView: props.optimiseStreetView,
            },
            {
                mode: mode.value,
                areaParams: props.areaParams,
                areasJson: areasJson.value,
            },
            props.placeGeoJson,
            props.roundsPredefined
        );
    }

    if (!props.multiplayer) {
        await loadStreetView();
        mapContainer.value?.startNextRound();

        if (timeLimitation.value !== 0) {
            if (!hasTimerStarted.value) {
                initTimer(timeLimitation.value);
                hasTimerStarted.value = true;
            }
        }
    } else {
        registerGeoNextEvents();
    }

    header.value?.startTimer();

    devScan();
    setTimeout(() => {
        devScan();
    }, 200);
});

onBeforeUnmount(() => {
    const widgetScene = document.querySelector('.widget-scene');
    if (widgetScene) {
        widgetScene.removeEventListener('keydown', onUserEventPanoramaKey);
        widgetScene.removeEventListener('mousedown', onUserEventPanoramaMouse);
    }
    window.removeEventListener('beforeunload', () => {
        //
    });

    if (rndUnregister) rndUnregister();
    if (exitUnregister) exitUnregister();
    if (gameStateUpdateUnregister) gameStateUpdateUnregister();
});
</script>

<style scoped lang="scss">
#leaderboard-alert {
    opacity: 0.8;
    white-space: pre-line;
    float: right;
    pointer-events: none;
}

#game-page {
    position: relative;
    height: var(--global-height, 100%);
    width: 100%;
    top: 0;
    left: 0;
}

#street-view-container {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}
#game-interface {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;

    &__overlay {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
    }

    .resetBtn {
        position: absolute;
        bottom: 22px;
        right: 70px;
        z-index: 1;
        @media (max-width: 450px) {
            bottom: 65px;
        }
    }
}

#street-view {
    position: relative;
    min-height: 100%;
    width: 100%;
}
.alert-container {
    margin-top: 65px;
    .v-alert {
        z-index: 2;
    }
    #warningCountdown {
        width: fit-content;
        margin: 10px;
        margin-top: 90px;
        padding: auto 30px;
    }
}

@media (max-width: 450px) {
    #game-interface {
        display: grid;
        grid-template-rows: auto 44px;
        #game-interface--overlay {
            position: initial;
        }
    }

    #reset-button {
        bottom: 120px;
    }
}
</style>

<style>
#street-view
    div.gm-style:nth-child(1)
    > div:nth-child(2)
    > div:nth-child(1)
    > div:nth-child(9)
    > div:nth-child(1) {
    display: none !important;
}
</style>
