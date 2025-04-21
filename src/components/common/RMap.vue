<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { MapBrowserEvent } from 'ol';
// <<< Lucide 아이콘 임포트
import { Settings } from 'lucide-vue-next';

const MAP_DURATION = 300
const ZOOM_THRESHOLD = 18

const emit = defineEmits<{
  (e: 'select-feature', properties: any): void
  (e: 'close-drawer'): void
}>()

const props = defineProps<{ leftDrawer: boolean; rightDrawer?: boolean, type?: 'cover' | null }>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)
const roadLineLayer = ref<any>(null)
const roadPointLayer = ref<any | null>(null)
const selectedWayId = ref<string | null>(null);
const selectedPointCoords = ref<any>(null);
const isLoading = ref(false);

// --- Coordinate Comparison Helper ---
function compareCoordinates(coords1: any, coords2: any): boolean { /* ... 이전과 동일 ... */
  if (!coords1 || !coords2 || !Array.isArray(coords1) || !Array.isArray(coords2) || coords1.length < 2 || coords2.length < 2) { return false; }
  return coords1[0] === coords2[0] && coords1[1] === coords2[1];
}
// --- End Helper ---

// --- 스타일 객체 미리 생성 ---
const selectedLineStyle = new Style({ stroke: new Stroke({ color: 'rgba(128, 128, 128, 1.0)', width: 5 }) });
const defaultLineStyle = new Style({ stroke: new Stroke({ color: 'rgba(128, 128, 128, 0.7)', width: 3 }) });
const selectedPointStyle = new Style({ image: new Circle({ radius: 8, fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }) }), zIndex: 2 });
const relatedPointStyle = new Style({ image: new Circle({ radius: 4, fill: new Fill({ color: 'rgba(100, 100, 100, 1.0)' }) }), zIndex: 1 });
const defaultPointStyle = new Style({ image: new Circle({ radius: 4, fill: new Fill({ color: 'rgba(128, 128, 128, 0.4)' }) }) });
// --- 스타일 객체 미리 생성 끝 ---

// --- Style Function ---
const layerStyleFunction = (feature: any): Style | undefined => { /* ... 이전과 동일 ... */
  const currentZoom = map.value?.getView().getZoom();
  if (!currentZoom) return undefined;
  const geometry = feature.getGeometry();
  if (!geometry) return undefined;
  const featureType = geometry.getType();
  const properties = feature.getProperties();
  const featureWayId = featureType === 'LineString' ? properties['@id'] : properties['parent_way_id'];
  const isSelectedLine = selectedWayId.value != null && selectedWayId.value === featureWayId;
  let isSelectedPoint = false;
  if (featureType === 'Point' && selectedPointCoords.value) {
    const currentCoords = geometry.getCoordinates();
    isSelectedPoint = compareCoordinates(currentCoords, selectedPointCoords.value);
  }

  if (currentZoom < ZOOM_THRESHOLD) {
    if (featureType === 'LineString') { return isSelectedLine ? selectedLineStyle : defaultLineStyle; }
    else if (featureType === 'Point' && isSelectedPoint) { return selectedPointStyle; }
    else { return undefined; }
  } else {
    if (featureType === 'Point') {
      if (isSelectedPoint) { return selectedPointStyle; }
      else if (isSelectedLine) { return relatedPointStyle; }
      else { return defaultPointStyle; }
    } else { return undefined; }
  }
};
// --- End Style Function ---

const mapStyle = computed(() => { /* ... */
  return { right: props.rightDrawer ? '25%' : '0px', left: props.type === 'cover' ? '25%' : '0px', transition: 'all 0.3s ease' }
})
const center = fromLonLat([127.128, 37.378])

const loadLayers = async () => { /* ... 이전과 동일, isLoading 설정 확인 ... */
  if (!map.value) return;
  isLoading.value = true; // <<< 로딩 시작
  console.time("loadAllLayers");
  try {
    // ... Promise.all fetch, layer creation ...
    console.time("fetchData");
    const [lineResponse, pointResponse] = await Promise.all([fetch('/road_data.json'), fetch('/road_points_5m.json')]);
    console.timeEnd("fetchData");
    if (!lineResponse.ok) throw new Error(`Line data HTTP error! status: ${lineResponse.status}`);
    if (!pointResponse.ok) throw new Error(`Point data HTTP error! status: ${pointResponse.status}`);
    console.time("parseJson");
    const [lineData, pointData] = await Promise.all([lineResponse.json(), pointResponse.json()]);
    console.timeEnd("parseJson");
    console.time("createLineLayer");
    const lineFeatures = new GeoJSON().readFeatures(lineData, { dataProjection: 'EPSG:4326', featureProjection: map.value.getView().getProjection() });
    const lineSource = new VectorSource({ features: lineFeatures });
    lineSource.getFeatures().forEach((feature: any) => { const properties = feature.getProperties(); if (properties['@id']) { feature.setId(properties['@id']); } });
    roadLineLayer.value = new VectorLayer({ source: lineSource, style: layerStyleFunction });
    console.timeEnd("createLineLayer");
    console.time("createPointLayer");
    const pointFeatures = new GeoJSON().readFeatures(pointData, { dataProjection: 'EPSG:4326', featureProjection: map.value.getView().getProjection() });
    const pointSource = new VectorSource({ features: pointFeatures });
    roadPointLayer.value = new VectorLayer({ source: pointSource, style: layerStyleFunction, renderBuffer: 0 });
    console.timeEnd("createPointLayer");
    console.time("addLayers");
    map.value.addLayer(roadLineLayer.value); map.value.addLayer(roadPointLayer.value);
    console.timeEnd("addLayers");
    console.log("All layers loaded.");
  } catch (error) {
    console.error("Error loading layers:", error);
  } finally {
    isLoading.value = false; // <<< 로딩 종료
    console.timeEnd("loadAllLayers");
  }
}
const handleResetCenter = (coords: number[]) => { /* ... */
  map.value?.getView().animate({ center: coords, zoom: 15, duration: MAP_DURATION })
}
const mapResetHandler = (e: Event) => { /* ... */
  if (e instanceof CustomEvent) { const coords = e.detail; if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') { handleResetCenter(coords); } else { console.warn('Invalid map reset coordinates:', coords); } }
};

onMounted(async () => {
  if (!mapContainer.value) return
  map.value = new Map({
    target: mapContainer.value,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({ center, zoom: 14 })
  })
  await loadLayers();

  // Click Handler
  map.value?.on('singleclick', (e: MapBrowserEvent<UIEvent>) => { /* ... 이전과 동일 ... */
    let clickedFeatureInstance: any = null;
    let clickedLayer: any = null;
    map.value?.forEachFeatureAtPixel(e.pixel, (feature: any, layer: any) => {
      clickedFeatureInstance = feature; clickedLayer = layer; return true;
    }, { layerFilter: (layer: any) => layer === roadLineLayer.value || layer === roadPointLayer.value, hitTolerance: 4 });
    let clickedWayId: string | null = null;
    let clickedPointCoords: number[] | null = null;
    let isPointClick = false;
    let isLineClick = false;
    let lineFirstCoord: number[] | null = null;
    if (clickedFeatureInstance) {
      const props = clickedFeatureInstance.getProperties();
      const geometry = clickedFeatureInstance.getGeometry();
      const type = geometry?.getType();
      if (type === 'LineString') {
        clickedWayId = props['@id']; isLineClick = true; clickedPointCoords = null; lineFirstCoord = geometry.getFirstCoordinate();
      } else if (type === 'Point') {
        clickedWayId = props['parent_way_id']; clickedPointCoords = geometry.getCoordinates(); isPointClick = true;
      }
    }
    if (selectedWayId.value !== clickedWayId || !compareCoordinates(selectedPointCoords.value, clickedPointCoords)) {
      selectedWayId.value = clickedWayId; selectedPointCoords.value = clickedPointCoords;
      roadLineLayer.value?.getSource()?.changed(); roadPointLayer.value?.getSource()?.changed();
    }
    if (clickedFeatureInstance) {
      if (isLineClick && map.value && lineFirstCoord) {
        map.value.getView().animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION });
      } else if (isPointClick && map.value && clickedPointCoords) {
        map.value.getView().animate({ center: clickedPointCoords, duration: MAP_DURATION });
        const properties = clickedFeatureInstance.getProperties();
        if (properties.geometry) { delete properties.geometry; }
        emit('select-feature', properties);
      }
    } else {
      if (selectedWayId.value !== null || selectedPointCoords.value !== null) {
        selectedWayId.value = null; selectedPointCoords.value = null;
        roadLineLayer.value?.getSource()?.changed(); roadPointLayer.value?.getSource()?.changed();
      }
      emit('close-drawer');
    }
  });

  // Hover Handler
  map.value?.on('pointermove', (e: MapBrowserEvent<UIEvent>) => { /* ... 이전과 동일 ... */
    if (e.dragging) return;
    const pixel = map.value?.getEventPixel(e.originalEvent);
    if (!pixel || !map.value) return;
    const hit = map.value.forEachFeatureAtPixel(pixel, (f, l) => true, {
      layerFilter: (l: any) => l === roadLineLayer.value || l === roadPointLayer.value, hitTolerance: 2
    });
    const targetElement = map.value.getTargetElement() as HTMLElement | undefined;
    if (targetElement) { targetElement.style.cursor = hit ? 'pointer' : ''; }
  });

  // Zoom Change Listener
  map.value?.getView().on('change:resolution', () => { /* ... 이전과 동일 ... */
    roadLineLayer.value?.getSource()?.changed();
    roadPointLayer.value?.getSource()?.changed();
  });

  // Other Listeners
  window.addEventListener('reset-map-center', mapResetHandler);
  window.addEventListener('zoom-in-map', () => { const currentZoom = map.value?.getView().getZoom(); if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION }) });
  window.addEventListener('zoom-out-map', () => { const currentZoom = map.value?.getView().getZoom(); if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION }) });
})

onBeforeUnmount(() => {
  if (map.value) { map.value.setTarget(undefined); map.value = null; }
  window.removeEventListener('reset-map-center', mapResetHandler);
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="absolute top-0 left-0 w-full h-full" :style="mapStyle"></div>

    <Transition name="fade">
      <div v-if="isLoading"
        class="absolute inset-0 bg-gray-100 bg-opacity-60 flex items-center justify-center z-50 pointer-events-none">
        <div
          class="text-white text-xl bg-gray-100 bg-opacity-90 px-6 py-4 rounded-lg shadow-xl flex flex-col items-center space-y-3 w-150">
          <Settings :size="48" class="spin text-blue-400" />
          <span class="loading-text">
            서비스 로딩 중
            <span class="loading-dots" />
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Basic styling for map container */

/* Fade Transition CSS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* <<< 아이콘 회전 애니메이션 CSS */
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* <<< 아이콘 회전 애니메이션 CSS 끝 */

/* <<< CSS 점 애니메이션 추가 */
.loading-dots::after {
  display: inline-block;
  /* 내용을 가지지 않고 너비/높이를 가지도록 */
  vertical-align: bottom;
  /* 텍스트 기준선에 맞춤 */
  overflow: hidden;
  /* 애니메이션 단계 중 점 숨김 */
  width: 0px;
  /* 실제 너비는 애니메이션으로 제어 */
  content: '....';
  /* 실제로는 보이지 않지만 너비 계산 등에 영향 가능 */
  animation: dots 1.4s steps(4, end) infinite;
  /* 1.4초 간격, 4단계 */
}

@keyframes dots {

  0%,
  20% {
    /* 점 0개 (너비 0) */
    width: 0px;
    /* content: '\00a0'; */
    /* 빈 칸으로 보이게 할 수도 있음 */
  }

  40% {
    /* 점 1개 */
    width: .35em;
    /* 글꼴 크기에 맞춰 조정 */
    /* content: '.'; */
  }

  60% {
    /* 점 2개 */
    width: .7em;
    /* content: '..'; */
  }

  80% {
    /* 점 3개 */
    width: 1.05em;
    /* content: '...'; */
  }

  100% {
    /* 점 3개 */
    width: 1.4em;
    /* content: '....'; */
  }
}

/* <<< CSS 점 애니메이션 끝 */

/* Optional: 텍스트 정렬 등 미세 조정 */
.loading-text {
  display: inline-flex;
  /* span 내부 정렬을 위해 */
  align-items: baseline;
  /* 점과 텍스트 기준선 맞춤 */
}
</style>
