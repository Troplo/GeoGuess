<template>
    <div id="stats" class="ma-4 mb-0">
        <v-row dense align="stretch" justify="center">
            <v-col
                v-for="(item, index) in statItems"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                xl="2"
            >
                <v-card elevation="3" class="text-center py-4">
                    <p class="text-h3 font-weight-bold mb-1">
                        {{ item.value }}
                    </p>
                    <p class="text-subtitle-1 text-medium-emphasis">
                        {{ item.label }}
                    </p>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getCountdownText } from '../../utils';

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
                averageScore: Math.round(
                    this.getAverageScore()
                ).toLocaleString(),
                averageScoreGame: Math.round(
                    this.getAverageScoreGame()
                ).toLocaleString(),
            };
        },
        statItems() {
            return [
                {
                    label: this.$t('History.Stats.hours'),
                    value: (this.stats.totalGameTime / 3600).toFixed(2),
                },
                {
                    label: this.$t('History.Stats.perfect5000'),
                    value: `${this.stats.perfectScores}/${this.rounds.length}`,
                },
                {
                    label: this.$t('History.Stats.averageTime'),
                    value: `${(this.stats.avgTimePerRound / 60).toFixed(
                        2
                    )} min`,
                },
                {
                    label: this.$t('History.Stats.averageGame'),
                    value: `${(this.stats.avgTimePerGame / 60).toFixed(2)} min`,
                },
                {
                    label: this.$t('History.Stats.longestGame'),
                    value: `${(this.stats.longestGame / 60).toFixed(2)} min`,
                },
                {
                    label: this.$t('History.Stats.wonMultiplayer'),
                    value: `${this.stats.wonGames.won}/${this.stats.wonGames.total}`,
                },
                {
                    label: this.$t('History.Stats.averageScore'),
                    value: this.stats.averageScore,
                },
                {
                    label: this.$t('History.Stats.averageScoreGame'),
                    value: this.stats.averageScoreGame,
                },
            ];
        },
        rounds() {
            let rounds = [];
            for (const game of this.history) {
                if (game.playerName) {
                    for (const round of game.rounds) {
                        if (!round.players[game.playerName]) continue;
                        rounds.push(round.players[game.playerName]);
                    }
                } else {
                    rounds.push(game.rounds);
                }
            }
            return rounds;
        },
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
            return this.rounds.filter((round) => round.points === 5000).length;
        },
        getTotalDuration() {
            return this.rounds.reduce((acc, { timePassed }) => {
                if (!timePassed) return acc;
                return acc + Math.floor(timePassed / 1000);
            }, 0);
        },
        getAvgTimePerRound() {
            if (!this.rounds.length) return 0;
            return (
                this.rounds.reduce((acc, { timePassed }) => {
                    if (!timePassed) return acc;
                    return acc + Math.floor(timePassed / 1000);
                }, 0) / this.rounds.length
            );
        },
        getWonGames() {
            let gamesWon = 0;
            let gamesTotal = 0;
            for (const game of this.history) {
                const playerPoints = game.points;
                if (game.playerName) {
                    const allPlayersPoints = Object.entries(
                        game.rounds.reduce((acc, round) => {
                            for (const [player, playerRound] of Object.entries(
                                round.players
                            )) {
                                if (!acc[player]) acc[player] = 0;
                                if (player === game.playerName) continue;
                                acc[player] += playerRound.points;
                            }
                            return acc;
                        }, {})
                    );
                    if (
                        allPlayersPoints.every(
                            ([, points]) => points < playerPoints
                        )
                    ) {
                        gamesWon++;
                    }
                    gamesTotal++;
                }
            }
            return { won: gamesWon, total: gamesTotal };
        },
        getAvgTimePerGame() {
            if (!this.history.length) return 0;
            return (
                this.history.reduce((acc, { playerName, rounds }) => {
                    if (playerName) {
                        let timePassed = 0;
                        for (const round of rounds) {
                            if (!round.players[playerName]) continue;
                            timePassed += round.players[playerName].timePassed;
                        }
                        return acc + Math.floor(timePassed / 1000);
                    } else {
                        return (
                            acc +
                            rounds.reduce((acc, { timePassed }) => {
                                if (!timePassed) return acc;
                                return acc + Math.floor(timePassed / 1000);
                            }, 0)
                        );
                    }
                }, 0) / this.history.length
            );
        },
        getLongestGame() {
            if (!this.history.length) return 0;
            return this.history.reduce((acc, { playerName, rounds }) => {
                if (playerName) {
                    let timePassed = 0;
                    for (const round of rounds) {
                        if (!round.players[playerName]) continue;
                        timePassed += round.players[playerName].timePassed;
                    }
                    return Math.max(acc, Math.floor(timePassed / 1000));
                } else {
                    return Math.max(
                        acc,
                        rounds.reduce((acc, { timePassed }) => {
                            if (!timePassed) return acc;
                            return acc + Math.floor(timePassed / 1000);
                        }, 0)
                    );
                }
            }, 0);
        },
        getAverageScore() {
            if (!this.rounds.length) return 0;
            return (
                this.rounds.reduce((acc, { points }) => {
                    if (!points) return acc;
                    return acc + points;
                }, 0) / this.rounds.length
            ).toFixed(2);
        },
        getAverageScoreGame() {
            if (!this.history.length) return 0;
            return (
                this.history.reduce((acc, { points }) => {
                    if (!points) return acc;
                    return acc + points;
                }, 0) / this.history.length
            ).toFixed(2);
        },
    },
};
</script>

<style lang="scss" scoped>
#stats {
    padding: 1rem;
    h2 {
        text-align: center;
    }

    .v-card {
        border-radius: 16px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .v-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 600px) {
        .text-h3 {
            font-size: 1.8rem;
        }
    }
}
</style>
