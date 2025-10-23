<template>
    <div>
        <v-app-bar class="header-game" color="grey-darken-4">
            <DialogMessage
                :dialog-message="scoreboard"
                dialog-title="Leaderboard"
                :dialog-text="guessString"
                :dismissible="true"
                @close="scoreboard = false"
            />
            <geo-btn
                icon
                @click="scoreboard = true"
                v-if="
                    $vuetify.display.mobile && guessString && leaderboardShown
                "
            >
                <v-icon>mdi-scoreboard-outline</v-icon>
            </geo-btn>
            <div class="ml-4">
                <div v-if="remainingTime != null && remainingTime > 0">
                    <span id="countdown-text">{{ countdownText }}</span>
                </div>

                <div v-else>
                    <span id="countdown-text">{{ timerText }}</span>
                </div>
            </div>
            <div
                v-if="roomName && !$home.streamerMode"
                class="round-score-container room-name"
            >
                <span class="sub-text">{{ $t('HeaderGame.room') }} : </span>
                <span class="main-text">
                    {{ roomName }}
                </span>
            </div>
            <v-spacer />
            <v-tooltip location="bottom" v-if="allowReRoll">
                <template v-slot:activator="{ props }">
                    <span v-bind="props">
                        <geo-btn
                            icon
                            @click="reRollGame()"
                            :disabled="reRollVoted"
                        >
                            <v-icon v-if="!reRollVoted"
                                >mdi-dice-multiple</v-icon
                            >
                            <v-icon v-else>mdi-check</v-icon>
                        </geo-btn>
                        <v-badge
                            v-if="votedCount"
                            :content="votedCount"
                            color="blue"
                        >
                        </v-badge>
                    </span>
                </template>
                <span v-if="!multiplayer">{{ $t('HeaderGame.reRoll') }}</span>
                <span v-else>{{
                    $t('HeaderGame.reRollMultiplayer', {
                        count: votedCount,
                        total: playerCount,
                    })
                }}</span>
            </v-tooltip>
            <div class="round-score-container">
                <span class="sub-text">{{ $t('HeaderGame.round') }}: </span>
                <span id="roundLabel" class="main-text">
                    {{ round }} / {{ nbRound }}
                </span>
            </div>

            <div v-if="isDistanceVisible" class="round-score-container">
                <span class="sub-text">{{ $t('HeaderGame.distance') }}: </span>
                <span class="main-text">{{
                    $t('HeaderGame.kmaway', {
                        value: new Intl.NumberFormat($i18n.locale).format(
                            distance / 1000
                        ),
                    })
                }}</span>
            </div>
            <div class="round-points-container mr-2">
                <span class="sub-text">{{ $t('HeaderGame.score') }}: </span>

                <span class="main-text">{{ points }}</span>
            </div>
        </v-app-bar>
    </div>
</template>

<script>
import { getCountdownText } from '@/utils';
import { GAME_MODE } from '@/constants';
import { mapState } from 'vuex';
import DialogMessage from '@/components/DialogMessage.vue';

export default {
    components: {
        DialogMessage,
    },
    props: [
        'distance',
        'points',
        'round',
        'remainingTime',
        'roomName',
        'nbRound',
        'guessString',
        'leaderboardShown',
        'multiplayer',
        'reRollGame',
        'reRollVoted',
        'playerCount',
        'votedCount',
        'allowReRoll',
        'mode',
        'startedAt',
    ],
    data() {
        return {
            scoreboard: false,
            timerText: '',
            intervalFunction: null,
        };
    },
    watch: {
        round: function () {
            this.startTimer();
        },
    },
    computed: {
        countdownText() {
            return getCountdownText(this.remainingTime);
        },
        isDistanceVisible() {
            return this.mode !== GAME_MODE.COUNTRY;
        },
    },
    methods: {
        startTimer() {
            if (this.remainingTime != 0) {
                return;
            }

            this.intervalFunction = setInterval(() => {
                this.timerText = getCountdownText(
                    Math.round((Date.now() - this.startedAt) / 1000)
                );
            }, 1000);
        },
        stopTimer() {
            if (this.intervalFunction) {
                clearInterval(this.intervalFunction);
            }
        },
    },
};
</script>

<style scoped lang="scss">
.header-game {
    z-index: 3;
    opacity: 0.8;
}

.toolbar-title {
    color: white;
}

.round-score-container {
    padding: 0 10px 0 40px;
}

.round-points-container {
    padding: 0 10px 0 40px;
}

.main-text,
#countdown-text {
    color: white;
}

.sub-text {
    color: #616161;
}
@media (max-width: 555px) {
    .room-name {
        display: none;
    }
    .main-text,
    .sub-text,
    #countdown-text {
        font-size: 14px;
    }

    .round-score-container {
        padding: 0 5%;
        .sub-text {
            display: none;
        }
    }

    .round-points-container {
        padding: 0 5%;
        .sub-text {
            display: none;
        }
    }
}
</style>
