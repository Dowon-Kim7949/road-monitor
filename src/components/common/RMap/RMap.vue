<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Cog } from 'lucide-vue-next'
import OLMap from 'ol/Map'
import VectorLayer from 'ol/layer/Vector'
import HeatmapLayer from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import type LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import type { FeatureLike } from 'ol/Feature'
import { MAP_DURATION, ZOOM_DEFAULT, makeIriLayer, loadLayers, loadBridgeLayer, initMap, layerStyleFunction, destroyMap, bindMapInteractions } from '@/components/common/RMap/init_map'

const emit = defineEmits<{
  (e: 'select-feature', properties: any): void
  (e: 'close-drawer'): void
  (e: 'completed-load'): boolean
}>()

const props = defineProps<{
  leftDrawer: boolean
  rightDrawer?: boolean
  type?: 'road' | 'cover' | 'rpci' | 'report' | 'surrounding' | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<OLMap | null>(null)
const roadLineLayer = ref<VectorLayer<VectorSource<LineString | any>> | null>(null)
const roadPointLayer = ref<VectorLayer<VectorSource<Point | any>> | null>(null)
const selectedWayId = ref<string | null>(null)
const selectedPointCoords = ref<any>(null)
const isLoading = ref(false)
const iriHeatmapLayer = ref<HeatmapLayer | null>(null)
const center = fromLonLat([-0.22365497581524368, 51.49220408472129])
const currentZoom = ref(ZOOM_DEFAULT)
const bridgeLayer = ref<VectorLayer<VectorSource<any>> | null>(null)

const mapStyle = computed(() => {
  return {
    right: props.rightDrawer ? '25%' : '0px',
    left: props.type === 'cover' ? '25%' : '0px',
    transition: 'all 0.3s ease',
  }
})

const zoomInMapHandler = () => {
  const currentZoom = map.value?.getView().getZoom()
  if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION })
}

const zoomOutMapHandler = () => {
  const currentZoom = map.value?.getView().getZoom()
  if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION })
}

const handleResetCenter = () => {
  map.value?.getView().animate({ center: center, zoom: ZOOM_DEFAULT, duration: MAP_DURATION })
}

const showIriLayerHandler = async () => {
  if (map.value) {
    await makeIriLayer(map.value as any, isLoading, iriHeatmapLayer as any, selectedWayId, center);
  }
};

const hideIriLayerHandler = () => {
  if (map.value && iriHeatmapLayer.value) {
    map.value.removeLayer(iriHeatmapLayer.value as any);
    iriHeatmapLayer.value = null;
  }
}

const showBridgeLayerHandler = async () => {
  if (map.value) {
    await loadBridgeLayer(map.value as any)
  }
}

const hideBridgeLayerHandler = () => {
  if (map.value && bridgeLayer.value) {
    map.value.removeLayer(bridgeLayer.value as any)
    bridgeLayer.value = null
  }
}

const onZoomChange = (zoom: number) => currentZoom.value = zoom

const styleFn = (feature: FeatureLike) => {
  if (!map.value || !props.type) return undefined
  return layerStyleFunction(feature, map.value as any, props.type, selectedWayId.value, selectedPointCoords.value)
}

const addWindowEventListener = async () => {
  window.addEventListener('reset-map-center', handleResetCenter)
  window.addEventListener('zoom-in-map', zoomInMapHandler)
  window.addEventListener('zoom-out-map', zoomOutMapHandler)
  window.addEventListener('show-iri-layer', showIriLayerHandler)
  window.addEventListener('hide-iri-layer', hideIriLayerHandler)
  window.addEventListener('show-bridge-layer', showBridgeLayerHandler)
  window.addEventListener('hide-bridge-layer', hideBridgeLayerHandler)
}

const removeWindowEventListener = () => {
  window.removeEventListener('reset-map-center', handleResetCenter)
  window.removeEventListener('show-iri-layer', showIriLayerHandler)
  window.removeEventListener('hide-iri-layer', hideIriLayerHandler)
  window.removeEventListener('show-bridge-layer', showBridgeLayerHandler)
  window.removeEventListener('hide-bridge-layer', hideBridgeLayerHandler)
  window.removeEventListener('zoom-in-map', zoomInMapHandler)
  window.removeEventListener('zoom-out-map', zoomOutMapHandler)
}

onMounted(async () => {
  if (!mapContainer.value) return
  map.value = initMap(mapContainer.value, center, onZoomChange)

  if (map.value && props.type) {
    await loadLayers(
      map.value as any,
      props.type,
      styleFn,
      isLoading,
      roadLineLayer as any,
      roadPointLayer as any
    )

    bindMapInteractions({
      map: map.value as any,
      type: props.type,
      roadLineLayer: roadLineLayer as any,
      roadPointLayer: roadPointLayer as any,
      selectedWayId,
      selectedPointCoords,
      emit
    })
  }

  await addWindowEventListener()
})

onBeforeUnmount(() => {
  if (map.value) destroyMap(map.value as any)
  removeWindowEventListener()
})

watch(() => isLoading.value, (value) => {
  if (!value) {
    emit('completed-load')
  }
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="absolute top-0 left-0 h-full" :style="mapStyle">
      <div id="iri-tooltip" class="ol-tooltip">
        <div id="iri-tooltip-content"></div>
      </div>
    </div>
    <Transition name="fade">
      <div v-if="isLoading"
        class="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50 pointer-events-none">
        <div
          class="text-black text-xl bg-white bg-opacity-90 px-6 py-4 rounded-lg flex flex-row items-center space-x-3">
          <Cog :size="48" class="spin text-green-600" />
          <span class="loading-text">Loading RoadMonitor</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spin {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  display: inline-flex;
  align-items: baseline;
  font-weight: bold;
}

.ol-tooltip {
  position: absolute;
  background: rgba(50, 50, 50, 0.8);
  color: white;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  white-space: pre-wrap;
  pointer-events: none;
  transform: translate(-50%, -110%);
  transition: opacity 0.2s;
  opacity: 0;
  z-index: 10;
  border: 1px solid white;
}

.ol-tooltip:empty {
  opacity: 0;
}

.ol-tooltip-visible {
  opacity: 1;
}
</style>
