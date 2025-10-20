<template>
    <!-- @ts-ignore -->
    <v-btn
        v-bind="{ ...(props || {}), ...($attrs || {}) }"
        :class="classes"
        @mousemove="handleMouseMove"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div
            v-if="eligibleForShimmer"
            class="shimmer-effect"
            :class="{ active: isHovered }"
            :style="{
                '--shimmer-x': shimmerX + '%',
                '--shimmer-y': shimmerY + '%',
                '--shimmer-strength': '10%',
            }"
        ></div>
        <slot />
    </v-btn>
</template>

<script setup lang="ts">
import { IconValue } from 'vuetify/lib/composables/icons';
import { VBtn } from 'vuetify/components';
import { useExperimentsStore } from '@/modernStores/experiments.store.js';
import { useShimmer } from '@/plugins/composables/useShimmer.js';
import { computed } from 'vue';

const props = defineProps({
    block: { type: Boolean, default: undefined },
    color: { type: String, default: undefined },
    variant: {
        type: String as () =>
            | 'flat'
            | 'tonal'
            | 'elevated'
            | 'outlined'
            | 'text'
            | 'plain',
        default: undefined,
    },
    theme: { type: String, default: undefined },
    tag: { type: String as () => 'type' | 'default', default: undefined },
    size: {
        type: [String, Number] as unknown as () => string | number,
        default: undefined,
    },
    href: { type: String, default: undefined },
    replace: { type: Boolean, default: undefined },
    to: { type: String, default: undefined },
    exact: { type: Boolean, default: undefined },
    rounded: { type: [String, Boolean, Number], default: undefined },
    tile: { type: Boolean, default: undefined },
    position: {
        type: String as () =>
            | 'fixed'
            | 'absolute'
            | 'relative'
            | 'static'
            | 'sticky',
        default: undefined,
    },
    loading: { type: [String, Boolean], default: undefined },
    value: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    selectedClass: { type: String, default: undefined },
    class: { type: String, default: undefined },
    elevation: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    maxHeight: { type: [String, Number], default: undefined },
    maxWidth: { type: [String, Number], default: undefined },
    minHeight: { type: [String, Number], default: undefined },
    minWidth: { type: [String, Number], default: undefined },
    width: { type: [String, Number], default: undefined },
    density: {
        type: [String as () => 'compact' | 'comfortable' | 'default'],
        default: undefined,
    },
    border: { type: [String, Boolean, Number], default: undefined },
    active: { type: Boolean, default: undefined },
    activeColor: { type: String, default: undefined },
    baseColor: { type: String, default: undefined },
    symbol: { type: String, default: undefined },
    flat: { type: Boolean, default: undefined },
    icon: {
        type: [Boolean, String] as unknown as () => boolean | IconValue,
        default: undefined,
    },
    prependIcon: {
        type: String as unknown as () => IconValue,
        default: undefined,
    },
    appendIcon: {
        type: String as unknown as () => IconValue,
        default: undefined,
    },
    readonly: { type: Boolean, default: undefined },
    slim: { type: Boolean, default: undefined },
    stacked: { type: Boolean, default: undefined },
    ripple: { type: Boolean, default: undefined },
    text: { type: String, default: undefined },
});

type BtnSlots = InstanceType<typeof VBtn>['$slots'];
defineOptions({ inheritAttrs: false });
const slots = defineSlots<BtnSlots>();

const experimentsStore = useExperimentsStore();

const classes = computed(() => {
    let classStr = props.class;
    classStr += ' overflow-hidden shimmer-parent';
    if (
        experimentsStore.experiments.INTERACTIVE_BUTTONS &&
        !experimentsStore.experiments.DISABLE_ANIMATIONS
    ) {
        classStr +=
            ' transition-transform duration-150 ease-out active:scale-[97%] origin-center';
    }

    return classStr;
});

const {
    eligibleForShimmer,
    shimmerX,
    shimmerY,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
} = useShimmer();
</script>
