<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { MapBrowserEvent } from 'ol';
import { Cog } from 'lucide-vue-next';

const MAP_DURATION = 300
const ZOOM_THRESHOLD = 19 // 점/선 전환 레벨
const ZOOM_DEFAULT = 17

const emit = defineEmits<{
  (e: 'select-feature', properties: any): void
  (e: 'close-drawer'): void
}>()

const props = defineProps<{
  leftDrawer: boolean;
  rightDrawer?: boolean;
  type?: 'road' | 'cover' | 'rpci' | 'report' | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<OLMap | null>(null)
const roadLineLayer = ref<any>(null)
const roadPointLayer = ref<any | null>(null)
const selectedWayId = ref<string | null>(null);
const selectedPointCoords = ref<any>(null);
const isLoading = ref(false);

// --- Helper Functions ---
function compareCoordinates(coords1: any, coords2: any): boolean {
  if (!coords1 || !coords2 || !Array.isArray(coords1) || !Array.isArray(coords2) || coords1.length < 2 || coords2.length < 2) { return false; }
  return coords1[0] === coords2[0] && coords1[1] === coords2[1];
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || typeof hex !== 'string') hex = '#808080';
  if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) alpha = 1.0;
  let hexValue = hex.startsWith('#') ? hex.slice(1) : hex;
  let r: number, g: number, b: number;
  if (hexValue.length === 3) { r = parseInt(hexValue[0] + hexValue[0], 16); g = parseInt(hexValue[1] + hexValue[1], 16); b = parseInt(hexValue[2] + hexValue[2], 16); }
  else if (hexValue.length === 6) { r = parseInt(hexValue.substring(0, 2), 16); g = parseInt(hexValue.substring(2, 4), 16); b = parseInt(hexValue.substring(4, 6), 16); }
  else { return `rgba(128, 128, 128, ${alpha})`; }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
// --- End Helpers ---

// --- RPCI 색상 정보 ---
const rpciColors: { [key: string]: string } = {
  'green': '#00CC25',  // 60%
  'yellow': '#FEFD33', // 30%
  'orange': '#FF2B06', // 5%
  'darkRed': '#AB1803', // 3%
  'darkGreen': '#007e12', // 2% - 사용자 지정 유지
  'default': '#808080'
};
const rpciColorDistribution = [
  { color: rpciColors.green, threshold: 0.60 },
  { color: rpciColors.yellow, threshold: 0.90 }, // 60 + 30
  { color: rpciColors.orange, threshold: 0.95 }, // 90 + 5
  { color: rpciColors.darkRed, threshold: 0.98 }, // 95 + 3
  { color: rpciColors.darkGreen, threshold: 1.00 }  // 98 + 2
];
// --- End RPCI Info ---


// --- 스타일 객체 미리 생성 (road 모드용) ---
const roadSelectedLineStyle = new Style({ stroke: new Stroke({ color: 'rgba(80, 80, 80, 1)', width: 10 }) });
const roadDefaultLineStyle = new Style({ stroke: new Stroke({ color: 'rgba(80, 80, 80, 0.5)', width: 5 }) });
const roadSelectedPointStyle = new Style({ image: new Circle({ radius: 10, fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }) }), zIndex: 2 });
const roadRelatedPointStyle = new Style({ image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(100, 100, 100, 1.0)' }) }), zIndex: 1 });
const roadDefaultPointStyle = new Style({ image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(80, 80, 80, 0.5)' }) }) });
// --- 스타일 객체 미리 생성 끝 ---

// --- Style Function (모드별 분기) ---
const layerStyleFunction = (feature: any): Style | undefined => {
  const currentZoom = map.value?.getView().getZoom();
  if (!currentZoom) return undefined;
  const geometry = feature.getGeometry();
  if (!geometry) return undefined;
  const featureType = geometry.getType();
  const properties = feature.getProperties();
  const featureWayId = featureType === 'LineString' ? properties['@id'] : properties['parent_way_id'];

  // 기본 선택 상태 판단
  const isSelectedLine = selectedWayId.value != null && selectedWayId.value === featureWayId;
  let isSelectedPoint = false;
  if (featureType === 'Point' && selectedPointCoords.value) {
    const currentCoords = geometry.getCoordinates();
    isSelectedPoint = compareCoordinates(currentCoords, selectedPointCoords.value);
  }
  const isGenerallySelected = (featureType === 'LineString' && isSelectedLine) || (featureType === 'Point' && isSelectedPoint);
  const isLineRelatedSelected = selectedWayId.value != null && selectedWayId.value === featureWayId;


  switch (props.type) {
    case 'cover':
      // 단순 회색 선만 항상 표시
      if (featureType === 'LineString') {
        // road 모드의 기본 스타일 재사용 또는 단순 스타일 생성
        return roadDefaultLineStyle;
        // return new Style({ stroke: new Stroke({ color: 'rgba(128, 128, 128, 0.7)', width: 3 }) });
      } else {
        return undefined; // 점 숨김
      }

    case 'report':
      // rpci 색상 선만 항상 표시 (임시 색상 사용)
      if (featureType === 'LineString') {
        const assignedColorHex = properties['assigned_rpci_color'] || rpciColors['default'];
        // 선택 없으므로 기본 투명도 적용
        const colorRgba = hexToRgba(assignedColorHex, 0.7);
        return new Style({ stroke: new Stroke({ color: colorRgba, width: 5 }) }); // 약간 굵게
      } else {
        return undefined; // 점 숨김
      }

    case 'rpci':
      // rpci 색상 + 선택 효과 + 줌 레벨별 표시 (임시 색상 사용)
      const assignedColorHex = properties['assigned_rpci_color'] || rpciColors['default'];
      const selectedOpacity = 1.0;
      const defaultOpacity = 0.7;
      const pointDefaultOpacity = 0.6;

      // 선택된 선 또는 선택된 점이 속한 선이면 불투명, 아니면 기본 투명도
      const currentOpacity = isLineRelatedSelected ? selectedOpacity : (featureType === 'Point' ? pointDefaultOpacity : defaultOpacity);
      const currentColor = hexToRgba(assignedColorHex, currentOpacity);

      // 선택된 선/점은 굵게/크게
      const currentLineWidth = isLineRelatedSelected ? 10 : 6;
      const currentPointRadius = isSelectedPoint ? 10 : 6; // 선택된 '점'만 크게

      if (currentZoom < ZOOM_THRESHOLD) {
        // 줌 아웃: 선 표시, 선택된 점만 표시
        if (featureType === 'LineString') {
          return new Style({ stroke: new Stroke({ color: currentColor, width: currentLineWidth }) });
        } else if (featureType === 'Point' && isSelectedPoint) {
          // 선택된 점은 grade 색상, 불투명, 크게
          return new Style({ image: new Circle({ radius: currentPointRadius, fill: new Fill({ color: hexToRgba(assignedColorHex, selectedOpacity) }) }), zIndex: 2 });
        } else { return undefined; }
      } else { // currentZoom >= ZOOM_THRESHOLD
        // 줌 인: 점 표시, 선 숨김
        if (featureType === 'Point') {
          // 선택된 점: grade 색상, 불투명, 크게
          // 관련된 선 위의 다른 점: grade 색상, 불투명, 작게
          // 다른 점: grade 색상, 기본 투명도, 작게
          return new Style({
            image: new Circle({
              radius: currentPointRadius,
              fill: new Fill({ color: currentColor }) // isLineRelatedSelected로 투명도 조절됨
            }),
            zIndex: isSelectedPoint ? 2 : (isLineRelatedSelected ? 1 : 0)
          });
        } else { return undefined; }
      }

    case 'road': // 기본 회색 스타일 모드
    default:
      // 미리 생성된 스타일 객체 사용 + 줌 레벨별 표시
      if (currentZoom < ZOOM_THRESHOLD) {
        if (featureType === 'LineString') { return isSelectedLine ? roadSelectedLineStyle : roadDefaultLineStyle; }
        else if (featureType === 'Point' && isSelectedPoint) { return roadSelectedPointStyle; }
        else { return undefined; }
      } else {
        if (featureType === 'Point') {
          if (isSelectedPoint) { return roadSelectedPointStyle; }
          else if (isSelectedLine) { return roadRelatedPointStyle; }
          else { return roadDefaultPointStyle; }
        } else { return undefined; }
      }
  }
};
// --- End Style Function ---

const mapStyle = computed(() => { /* ... */
  return { right: props.rightDrawer ? '25%' : '0px', left: props.type === 'cover' ? '25%' : '0px', transition: 'all 0.3s ease' }
})
const center = fromLonLat([127.128, 37.378])

// <<< 통합된 레이어 로드 함수 (모드별 로드) >>>
const loadLayers = async () => {
  if (!map.value) return;
  isLoading.value = true;
  console.time("loadAllLayers");
  // 임시 색상 저장용 Map (rpci, report 모드에서 사용)
  const wayIdToColorMap = new Map<string, string>();

  try {
    // --- 선 데이터 로드 (항상 수행) ---
    console.time("loadLineData");
    const lineResponse = await fetch('/road_data.json');
    if (!lineResponse.ok) throw new Error(`Line data HTTP error! status: ${lineResponse.status}`);
    const lineData = await lineResponse.json();
    const lineFeatures = new GeoJSON().readFeatures(lineData, { dataProjection: 'EPSG:4326', featureProjection: map.value.getView().getProjection() });
    console.timeEnd("loadLineData");

    // --- 'rpci', 'report' 모드일 경우 임시 색상 할당 ---
    if (props.type === 'rpci' || props.type === 'report') {
      console.log(`Assigning random RPCI colors for mode: ${props.type}`);
      lineFeatures.forEach((feature: any) => {
        const rand = Math.random();
        let assignedColor = rpciColors['default'];
        for (let i = 0; i < rpciColorDistribution.length; i++) {
          if (rand <= rpciColorDistribution[i].threshold) {
            assignedColor = rpciColorDistribution[i].color;
            break;
          }
        }
        feature.set('assigned_rpci_color', assignedColor); // 피처에 임시 속성 설정

        const wayId = feature.getId();
        if (wayId) { wayIdToColorMap.set(wayId.toString(), assignedColor); }
      });
      console.log("Assigned temporary colors to lines.");
    }
    // --- 임시 색상 할당 끝 ---

    // --- 선 레이어 생성 및 추가 ---
    console.time("createLineLayer");
    const lineSource = new VectorSource({ features: lineFeatures });
    lineSource.getFeatures().forEach((feature: any) => { const properties = feature.getProperties(); if (properties['@id']) { feature.setId(properties['@id']); } });
    roadLineLayer.value = new VectorLayer({ source: lineSource, style: layerStyleFunction });
    map.value.addLayer(roadLineLayer.value);
    console.timeEnd("createLineLayer");
    // --- 선 레이어 생성 및 추가 끝 ---

    // --- 점 데이터 로드 ('road', 'rpci' 모드) ---
    if (props.type === 'road' || props.type === 'rpci') {
      console.time("loadPointData");
      const pointResponse = await fetch('/road_points_5m.json');
      if (!pointResponse.ok) throw new Error(`Point data HTTP error! status: ${pointResponse.status}`);
      const pointData = await pointResponse.json();
      const pointFeatures = new GeoJSON().readFeatures(pointData, { dataProjection: 'EPSG:4326', featureProjection: map.value.getView().getProjection() });
      console.timeEnd("loadPointData");

      // 'rpci' 모드일 경우 점에 부모 선 색상 상속
      if (props.type === 'rpci') {
        console.time("assignPointColors");
        pointFeatures.forEach((feature: any) => {
          const props = feature.getProperties();
          const parentId = props['parent_way_id']?.toString();
          if (parentId && wayIdToColorMap.has(parentId)) {
            feature.set('assigned_rpci_color', wayIdToColorMap.get(parentId));
          } else {
            feature.set('assigned_rpci_color', rpciColors['default']);
          }
        });
        console.timeEnd("assignPointColors");
      }

      console.time("createPointLayer");
      const pointSource = new VectorSource({ features: pointFeatures });
      roadPointLayer.value = new VectorLayer({ source: pointSource, style: layerStyleFunction, renderBuffer: 0 });
      map.value.addLayer(roadPointLayer.value);
      console.timeEnd("createPointLayer");
      console.log("Point layer loaded.");
    } else {
      roadPointLayer.value = null; // 다른 모드에서는 null 유지
    }
    // --- 점 데이터 로드 끝 ---

    console.log("All required layers loaded.");

  } catch (error) {
    console.error("Error loading layers:", error);
  } finally {
    isLoading.value = false;
    console.timeEnd("loadAllLayers");
  }
}
// <<< loadLayers 끝 >>>

const handleResetCenter = () => {
  map.value?.getView().animate({ center: center, zoom: ZOOM_DEFAULT, duration: MAP_DURATION })
}

const vworldTileLayer = new TileLayer({
  source: new XYZ({
    url: 'https://api.vworld.kr/req/wmts/1.0.0/1FD1DD92-D087-3EE3-9739-7459C1D23F72/Base/{z}/{y}/{x}.png'
  })
})

onMounted(async () => {
  console.log(props.type)
  if (!mapContainer.value) return
  map.value = new OLMap({
    target: mapContainer.value,
    layers: [vworldTileLayer],
    view: new View({ center, zoom: ZOOM_DEFAULT })
  })
  await loadLayers();

  // --- Click Handler (모드별 동작 분기 확인) ---
  map.value?.on('singleclick', (e: MapBrowserEvent<UIEvent>) => {
    if (props.type === 'cover' || props.type === 'report') { // <<< 'cover', 'report' 클릭 무시
      return;
    }

    let clickedFeatureInstance: any = null;
    let clickedLayer: any = null;
    const clickableLayers = [roadLineLayer.value];
    if (roadPointLayer.value) { clickableLayers.push(roadPointLayer.value); }

    map.value?.forEachFeatureAtPixel(e.pixel, (feature: any, layer: any) => {
      clickedFeatureInstance = feature; clickedLayer = layer; return true;
    }, { layerFilter: (layer: any) => clickableLayers.includes(layer), hitTolerance: 4 });

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
      roadLineLayer.value?.getSource()?.changed();
      roadPointLayer.value?.getSource()?.changed();
    }

    if (clickedFeatureInstance) {
      if (isLineClick && map.value && lineFirstCoord) {
        map.value.getView().animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION });
      } else if (isPointClick && map.value && clickedPointCoords) {
        map.value.getView().animate({ center: clickedPointCoords, duration: MAP_DURATION });
        // emit은 점 클릭 시에만 ('road', 'rpci'는 이미 위에서 필터링됨)
        const properties = clickedFeatureInstance.getProperties();
        if (properties.geometry) { delete properties.geometry; }
        emit('select-feature', properties);
      }
    } else {
      if (selectedWayId.value !== null || selectedPointCoords.value !== null) {
        selectedWayId.value = null; selectedPointCoords.value = null;
        roadLineLayer.value?.getSource()?.changed();
        roadPointLayer.value?.getSource()?.changed();
      }
      // emit은 'road', 'rpci' 모드에서만
      if (props.type === 'road' || props.type === 'rpci') {
        emit('close-drawer');
      }
    }
  });
  // --- End Click Handler ---

  // --- Hover Handler (모드별 동작 분기 확인) ---
  map.value?.on('pointermove', (e: MapBrowserEvent<UIEvent>) => {
    if (e.dragging) return;
    const pixel = map.value?.getEventPixel(e.originalEvent);
    if (!pixel || !map.value) return;

    // <<< 호버 가능 레이어 결정
    const hoverableLayers: any[] = [];
    if (roadLineLayer.value) hoverableLayers.push(roadLineLayer.value);
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      hoverableLayers.push(roadPointLayer.value);
    }

    const hit = map.value.forEachFeatureAtPixel(pixel, (f, l) => true, {
      layerFilter: (l: any) => hoverableLayers.includes(l),
      hitTolerance: 2
    });
    const targetElement = map.value.getTargetElement() as HTMLElement | undefined;
    if (targetElement) {
      // <<< 'cover', 'report' 모드에서는 커서 변경 안함
      if (props.type === 'cover' || props.type === 'report') {
        targetElement.style.cursor = '';
      } else {
        targetElement.style.cursor = hit ? 'pointer' : '';
      }
    }
  });
  // --- End Hover Handler ---

  // --- Zoom Change Listener ---
  map.value?.getView().on('change:resolution', () => {
    roadLineLayer.value?.getSource()?.changed();
    roadPointLayer.value?.getSource()?.changed(); // 존재할 때만 내부적으로 처리됨
  });
  // --- End Zoom Change Listener ---

  // --- Other Listeners ---
  window.addEventListener('reset-map-center', handleResetCenter);
  window.addEventListener('zoom-in-map', () => { const currentZoom = map.value?.getView().getZoom(); if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION }) });
  window.addEventListener('zoom-out-map', () => { const currentZoom = map.value?.getView().getZoom(); if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION }) });
  // --- End Other Listeners ---
})

onBeforeUnmount(() => { /* ... */
  if (map.value) { map.value.setTarget(undefined); map.value = null; }
  window.removeEventListener('reset-map-center', handleResetCenter);
  // TODO: Remove other listeners
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="absolute top-0 left-0 h-full" :style="mapStyle"></div>
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
/* ... 이전과 동일 ... */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
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
</style>
