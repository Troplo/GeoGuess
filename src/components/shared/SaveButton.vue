<template>
    <v-btn
        v-bind="$props"
        :color="success ? 'success' : color"
        @click="$emit('click')"
    >
        <slot v-if="!success" />
        <template v-else>
            <v-icon>mdi-check</v-icon>{{ $t('Saved') }}
        </template>
    </v-btn>
</template>

<script lang="js">
export default {
    name: 'SaveButton',
    data: () => ({
        success: false,
    }),
    watch: {
        loading(loading, wasLoading) {
            if (!loading && wasLoading) {
                this.success = true;
                setTimeout(() => {
                    this.success = false;
                }, 3000);
            }
        },
    },
};
</script>
