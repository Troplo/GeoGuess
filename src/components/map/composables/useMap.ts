import { watch, Ref } from 'vue';
import type { Map as GoogleMap, LatLngBoundsLiteral } from 'google.maps';

interface UseMapComposableOptions {
    map: Ref<GoogleMap | null>;
    bbox?: Ref<[number, number, number, number] | null>;
}

export function useMap(options: UseMapComposableOptions) {
    const { map, bbox } = options;

    function centerOnBbox() {
        if (!map.value) return;
        if (bbox?.value) {
            const bounds: LatLngBoundsLiteral = {
                east: bbox.value[2],
                north: bbox.value[3],
                south: bbox.value[1],
                west: bbox.value[0],
            };
            map.value.fitBounds(bounds);
        } else {
            map.value.$mapObject.setZoom(0);
            map.value.$mapObject.setCenter({ lat: 0, lng: 0 });
        }
    }

    function drawPolyline() {
        //
    }

    function removePolylines() {
        //
    }

    if (bbox) {
        watch(bbox, () => {
            centerOnBbox();
        });
    }

    return {
        centerOnBbox,
        drawPolyline,
        removePolylines,
    };
}
