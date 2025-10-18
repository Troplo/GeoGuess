<template>
    <v-alert
        v-if="!!alert"
        type="success"
        closable
        decelerated-easing
        class="header-alert"
        :icon="alert.icon"
        :color="alert.color"
        @update:model-value="closeAlert"
    >
        <h4>{{ $t(alert.title) }}</h4>
        <p>{{ $t(alert.subtitle) }}</p>
    </v-alert>
</template>

<script>
import { mapActions, mapState } from 'vuex';
export default {
    computed: {
        ...mapState('alertStore', ['alert']),
    },
    methods: {
        ...mapActions('alertStore', ['setAlert']),
        closeAlert(v) {
            !v && this.setAlert(null);
        },
    },
};
</script>

<style lang="scss">
.header-alert {
    width: fit-content;
    position: absolute;
    z-index: 210;
    right: 0;
    margin: 0.625rem;
}
</style>
