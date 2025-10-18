<template>
    <v-alert
        id="leaderboard-alert"
        standard-easing
        icon="mdi-scoreboard-outline"
        width="400"
        class="mt-2 mr-2"
        v-if="guessString && !$vuetify.display.mobile && leaderboardShown"
    >
        {{ guessString }}
    </v-alert>
</template>

<script>
export default {
    name: 'Leaderboard',
    props: ['guessString', 'leaderboardShown'],
};
</script>

<style scoped lang="scss">
#leaderboard-alert {
    opacity: 0.8;
    white-space: pre-line;
    float: right;
    pointer-events: none;
}
</style>
