<template>
    <div id="stats">
        <h2>
            Stats
        </h2>
        <v-layout wrap class="mt-2">
            <v-card class="text-center px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{ (stats.totalGameTime / 3600).toFixed(2) }}
                </p>
                <p class="text-h6 mt-n4">
                    hours spent in GeoGuess
                </p>
            </v-card>
            <v-card class="text-center ml-3 px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{ stats.perfectScores }}/{{ rounds.length }}
                </p>

                <p class="text-h6 mt-n4">
                    perfect 5000 point rounds
                </p>
            </v-card>
            <v-card class="text-center ml-3 px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{(stats.avgTimePerRound / 60).toFixed(2)}}min
                </p>

                <p class="text-h6 mt-n4">
                    average time to guess
                </p>
            </v-card>
            <v-card class="text-center ml-3 px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{(stats.avgTimePerGame / 60).toFixed(2)}}min
                </p>

                <p class="text-h6 mt-n4">
                    average game duration
                </p>
            </v-card>
            <v-card class="text-center ml-3 px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{(stats.longestGame / 60).toFixed(2)}}min
                </p>

                <p class="text-h6 mt-n4">
                    longest game
                </p>
            </v-card>
            <v-card class="text-center ml-3 px-6" max-width="400">
                <p class="text-h2 pt-3">
                    {{stats.wonGames.won}}/{{stats.wonGames.total}}
                </p>

                <p class="text-h6 mt-n4">
                    won multiplayer games
                </p>
            </v-card>
        </v-layout>
    </div>
</template>
<script>
import { mapActions, mapState } from 'vuex';
import { getCountdownText } from "../../utils";
export default {
    name: 'HistoryTable',
    computed: {
        ...mapState({
            history: (state) => state.homeStore.history,
        }),
        stats() {
            return {
                totalGameTime: this.getTotalDuration(),
                perfectScores: this.getPerfectScore(),
                avgTimePerRound: this.getAvgTimePerRound(),
                wonGames: this.getWonGames(),
                avgTimePerGame: this.getAvgTimePerGame(),
                longestGame: this.getLongestGame(),
            };
        },
        rounds() {
            let rounds = [];
            for (const game of this.history) {
                if(game.playerName) {
                    for(const round of game.rounds) {
                        if(!round.players[game.playerName]) continue;
                        rounds.push(round.players[game.playerName]);
                    }
                } else {
                    rounds.push(game.rounds);
                }
            }
            return rounds;
        }
    },
    mounted() {
        this.loadHistory();
    },
    methods: {
        ...mapActions(['loadHistory']),
        durationToText(time) {
            return getCountdownText(Math.floor(time));
        },
        getPerfectScore() {
            // count how many 5000 scores there are in this.rounds
            return this.rounds.filter((round) => round.points === 5000).length;
        },
        getTotalDuration() {
            return this.rounds.reduce(
                (acc, { timePassed }) => {
                    if(!timePassed) return acc;
                    return acc + Math.floor(timePassed / 1000);
                },
                0
            );
        },
        getAvgTimePerRound() {
            if(!this.rounds.length) return 0;
            return this.rounds.reduce(
                (acc, { timePassed }) => {
                    if(!timePassed) return acc;
                    return acc + Math.floor(timePassed / 1000);
                },
                0
            ) / this.rounds.length;
        },
        getWonGames() {
            let gamesWon = 0;
            let gamesTotal = 0;
            for (const game of this.history) {
                const playerPoints = game.points;
                if(game.playerName) {
                    const allPlayersPoints = Object.entries(game.rounds.reduce((acc, round) => {
                        for(const [player, playerRound] of Object.entries(round.players)) {
                            if(!acc[player]) acc[player] = 0;
                            if(player === game.playerName) continue;
                            acc[player] += playerRound.points;
                        }
                        return acc;
                    }, {}));
                    if(allPlayersPoints.every(([, points]) => points < playerPoints)) gamesWon++;
                    gamesTotal++;
                }
            }
            return {
                won: gamesWon,
                total: gamesTotal,
            };
        },
        getAvgTimePerGame() {
            if(!this.history.length) return 0;
            return this.history.reduce(
                (acc, {playerName, rounds}) => {
                    if(playerName) {
                        let timePassed = 0;
                        for(const round of rounds) {
                            if(!round.players[playerName]) continue;
                            timePassed += round.players[playerName].timePassed;
                        }
                        return acc + Math.floor(timePassed / 1000);
                    } else {
                        return acc + rounds.reduce((acc, { timePassed }) => {
                            if (!timePassed) return acc;
                            return acc + Math.floor(timePassed / 1000);
                        }, 0);
                    }
                },
                0
            ) / this.history.length;
        },
        getLongestGame() {
            if(!this.history.length) return 0;
            // get the longest game
            return this.history.reduce(
                (acc, {playerName, rounds}) => {
                    if(playerName) {
                        let timePassed = 0;
                        for(const round of rounds) {
                            if(!round.players[playerName]) continue;
                            timePassed += round.players[playerName].timePassed;
                        }
                        return Math.max(acc, Math.floor(timePassed / 1000));
                    } else {
                        return Math.max(acc, rounds.reduce((acc, { timePassed }) => {
                            if (!timePassed) return acc;
                            return acc + Math.floor(timePassed / 1000);
                        }, 0));
                    }
                },
                0
            );
        },
    },
};
</script>

<style lang="scss" scoped>
#stats {
    h2 {
        font-weight: 500;
    }
    padding: 0.625rem;
}
</style>
