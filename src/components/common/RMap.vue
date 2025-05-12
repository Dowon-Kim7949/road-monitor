<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue' // Added watch
import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import HeatmapLayer from 'ol/layer/Heatmap';
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { Feature, MapBrowserEvent, Overlay } from 'ol'
import { defaults as defaultInteractions, MouseWheelZoom } from 'ol/interaction'
import { Cog } from 'lucide-vue-next'
import type LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import type { FeatureLike } from 'ol/Feature'
import type { Coordinate } from 'ol/coordinate'
import { OSM } from 'ol/source'

// --- Constants and Emits (remain the same) ---
const MAP_DURATION = 300
const ZOOM_THRESHOLD = 19
const ZOOM_DEFAULT = 17
const ZOOM_MINLEVEL = 13
const ZOOM_MAXLEVEL = 21

const emit = defineEmits<{
  (e: 'select-feature', properties: any): void
  (e: 'close-drawer'): void
}>()

const props = defineProps<{
  leftDrawer: boolean
  rightDrawer?: boolean
  type?: 'road' | 'cover' | 'rpci' | 'report' | null // Added 'iri' type
}>()

// --- Refs (iriVectorLayer is already defined below) ---
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<OLMap | null>(null)
const roadLineLayer = ref<VectorLayer<VectorSource<LineString | any>> | null>(null)
const roadPointLayer = ref<VectorLayer<VectorSource<Point | any>> | null>(null)
const selectedWayId = ref<string | null>(null)
const selectedPointCoords = ref<any>(null)
const isLoading = ref(false)
const iriHeatmapLayer = ref<HeatmapLayer | null>(null) // Keep this ref for IRI layer
const iriCenter = ref(fromLonLat([127.128, 37.378])) // Default IRI center
const iriMode = ref(false)

// --- Styling and Helper Functions (remain the same) ---
const BORDER_COLOR = 'rgba(0, 0, 0, 0.8)' // 흰색 테두리 (반투명)
const BORDER_EXTRA_WIDTH = 4 // 테두리 두께 (양쪽 2px씩)

const compareCoordinates = (coords1: any, coords2: any): boolean => {
  if (
    !coords1 ||
    !coords2 ||
    !Array.isArray(coords1) ||
    !Array.isArray(coords2) ||
    coords1.length < 2 ||
    coords2.length < 2
  ) {
    return false
  }
  return coords1[0] === coords2[0] && coords1[1] === coords2[1]
}

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || typeof hex !== 'string') hex = '#808080'
  if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) alpha = 1.0
  let hexValue = hex.startsWith('#') ? hex.slice(1) : hex
  let r: number, g: number, b: number
  if (hexValue.length === 3) {
    r = parseInt(hexValue[0] + hexValue[0], 16)
    g = parseInt(hexValue[1] + hexValue[1], 16)
    b = parseInt(hexValue[2] + hexValue[2], 16)
  } else if (hexValue.length === 6) {
    r = parseInt(hexValue.substring(0, 2), 16)
    g = parseInt(hexValue.substring(2, 4), 16)
    b = parseInt(hexValue.substring(4, 6), 16)
  } else {
    return `rgba(128, 128, 128, ${alpha})`
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
const iriColorMapping = [
  { threshold: 5, color: 'rgba(0, 255, 0, 0.7)' },   // Adjusted IRI thresholds based on provided JSON data (example)
  { threshold: 10, color: 'rgba(255, 255, 0, 0.7)' },
  { threshold: 20, color: 'rgba(255, 165, 0, 0.7)' },
  { threshold: Infinity, color: 'rgba(255, 0, 0, 0.7)' }
];
const iriHeatmapGradient = [
  '#0000ff', // 0 (파랑)
  '#00ffff', // 1.67 (시안)
  '#00ff00', // 3.33 (초록)
  '#ffff00', // 5.00 (노랑)
  '#ffaa00', // 6.67 (주황)
  '#ff4500', // 8.33 (오렌지레드)
  '#ff0000'  // 10 (빨강)
];
const defaultIriColor = 'rgba(128, 128, 128, 0.7)'; // Grey for default or missing IRI

const rpciColors: { [key: string]: string } = {
  green: '#00CC25',
  yellow: '#FEFD33',
  orange: '#FF2B06',
  darkRed: '#AB1803',
  darkGreen: '#007e12',
  default: '#808080',
}
const rpciColorDistribution = [
  { color: rpciColors.green, threshold: 0.6 },
  { color: rpciColors.yellow, threshold: 0.9 },
  { color: rpciColors.orange, threshold: 0.95 },
  { color: rpciColors.darkRed, threshold: 0.98 },
  { color: rpciColors.darkGreen, threshold: 1.0 },
]

// --- Default Styles (remain the same) ---
const roadSelectedLineStyle = new Style({
  stroke: new Stroke({ color: 'rgba(80, 80, 80, 1)', width: 10 }),
})
const roadDefaultLineStyle = new Style({
  stroke: new Stroke({ color: 'rgba(80, 80, 80, 0.5)', width: 5 }),
})
const roadSelectedPointStyle = new Style({
  image: new Circle({ radius: 10, fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }) }),
  zIndex: 2,
})
const roadRelatedPointStyle = new Style({
  image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(100, 100, 100, 1.0)' }) }),
  zIndex: 1,
})
const roadDefaultPointStyle = new Style({
  image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(80, 80, 80, 0.5)' }) }),
})
const roadSelectedLineBorderStyle = new Style({
  stroke: new Stroke({
    color: BORDER_COLOR,
    width: 10 + BORDER_EXTRA_WIDTH,
  }),
  zIndex: 0,
})

// --- IRI Layer Style Function (from previous step) ---
const iriLayerStyleFunction = (feature: FeatureLike) => {
  const properties = feature.getProperties();
  const iriValue = properties['iri'];
  const featureId = feature.getId(); // Use feature ID for selection check
  let color = defaultIriColor;
  let strokeWidth = 6; // Default width
  let zIndex = 0;

  if (typeof iriValue === 'number') {
    for (const mapping of iriColorMapping) {
      if (iriValue <= mapping.threshold) {
        color = mapping.color;
        break;
      }
    }
  }

  // Check if this specific IRI feature is selected
  // Use feature.getId() because LineString features in iri_data.json have 'id'
  if (selectedWayId.value != null && selectedWayId.value === featureId?.toString()) {
    strokeWidth = 10; // Make selected line thicker
    zIndex = 1;      // Bring selected line to front
    // Optional: Apply a different color or border for selection if needed
    // For now, just making it thicker
  }

  return new Style({
    stroke: new Stroke({
      color: color,
      width: strokeWidth
    }),
    zIndex: zIndex // Apply zIndex
  });
};

// --- Main Layer Style Function (slightly modified for IRI) ---
const layerStyleFunction = (feature: FeatureLike): Style | Style[] | undefined => {
  const currentZoom = map.value?.getView().getZoom()
  if (!currentZoom) return undefined
  const geometry: any = feature.getGeometry()
  if (!geometry) return undefined
  const featureType = geometry.getType()
  const properties = feature.getProperties()
  // For points, get parent_way_id. For lines, use the feature's own ID.
  const featureWayId =
    featureType === 'LineString' ? feature.getId()?.toString() : properties['parent_way_id']?.toString()

  const isSelectedLine =
    selectedWayId.value != null && selectedWayId.value === featureWayId
  let isSelectedPoint = false
  if (featureType === 'Point' && selectedPointCoords.value) {
    const currentCoords = (geometry as Point).getCoordinates() // 타입 단언
    isSelectedPoint = compareCoordinates(currentCoords, selectedPointCoords.value)
  }

  // --- Handle IRI type separately if needed, or integrate into default ---
  // Note: The makeIriLayer function now uses its own dedicated style function (iriLayerStyleFunction).
  // This main layerStyleFunction will primarily style the roadLineLayer and roadPointLayer.
  // If you want IRI layer clicks to influence road layer styles, logic needs to be added here.
  // For now, assuming IRI styling is handled by iriLayerStyleFunction.

  switch (props.type) {
    case 'cover':
      if (featureType === 'LineString') {
        return roadDefaultLineStyle
      } else {
        return undefined
      }
    case 'report':
      if (featureType === 'LineString') {
        const assignedColorHex = properties['assigned_rpci_color'] || rpciColors['default']
        const colorRgba = hexToRgba(assignedColorHex, 0.7)
        return new Style({ stroke: new Stroke({ color: colorRgba, width: 5 }) })
      } else {
        return undefined
      }
    case 'rpci':
      const assignedColorHex = properties['assigned_rpci_color'] || rpciColors['default']
      const selectedOpacity = 1.0
      const defaultOpacity = 0.7
      const pointDefaultOpacity = 0.6

      if (featureType === 'LineString') {
        const mainStrokeWidth = isSelectedLine ? 10 : 6
        const mainOpacity = isSelectedLine ? selectedOpacity : defaultOpacity
        const mainColor = hexToRgba(assignedColorHex, mainOpacity)
        const mainStyle = new Style({
          stroke: new Stroke({ color: mainColor, width: mainStrokeWidth }),
          zIndex: isSelectedLine ? 1 : 0,
        })
        if (isSelectedLine && currentZoom < ZOOM_THRESHOLD) {
          const borderStyle = new Style({
            stroke: new Stroke({
              color: BORDER_COLOR,
              width: mainStrokeWidth + BORDER_EXTRA_WIDTH,
            }),
            zIndex: 0,
          })
          return [borderStyle, mainStyle]
        } else if (currentZoom < ZOOM_THRESHOLD) {
          return mainStyle
        } else {
          return undefined
        }
      } else if (featureType === 'Point') {
        const currentPointRadius = isSelectedPoint ? 10 : 6
        const isRelated = !isSelectedPoint && isSelectedLine
        const pointColor = hexToRgba(
          assignedColorHex,
          isSelectedPoint || isRelated ? selectedOpacity : pointDefaultOpacity,
        )
        if (currentZoom >= ZOOM_THRESHOLD) {
          return new Style({
            image: new Circle({
              radius: currentPointRadius,
              fill: new Fill({ color: isSelectedPoint ? 'rgba(255, 0, 0, 1.0)' : pointColor }),
            }),
            zIndex: isSelectedPoint ? 2 : isRelated ? 1 : 0,
          })
        } else if (isSelectedPoint) {
          return new Style({
            image: new Circle({
              radius: currentPointRadius,
              fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }),
            }),
            zIndex: 2,
          })
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    case 'road':
    default: // Also handles 'iri' for the road layers if needed, but iriLayer has own style
      if (currentZoom < ZOOM_THRESHOLD) {
        if (featureType === 'LineString') {
          if (isSelectedLine) {
            return [roadSelectedLineBorderStyle, roadSelectedLineStyle]
          } else {
            return roadDefaultLineStyle
          }
        } else if (featureType === 'Point' && isSelectedPoint) {
          return roadSelectedPointStyle
        } else {
          return undefined
        }
      } else {
        if (featureType === 'Point') {
          if (isSelectedPoint) {
            return roadSelectedPointStyle
          } else if (isSelectedLine) {
            return roadRelatedPointStyle
          } else {
            return roadDefaultPointStyle
          }
        } else {
          return undefined
        }
      }
  }
}


// --- Map Style and Center (remain the same) ---
const mapStyle = computed(() => {
  return {
    right: props.rightDrawer ? '25%' : '0px',
    left: props.type === 'cover' ? '25%' : '0px', // Consider adding 'iri' here if left drawer should open
    transition: 'all 0.3s ease',
  }
})
const center = fromLonLat([127.128, 37.378]) // Default map center

// --- loadLayers Function (remain the same) ---
const loadLayers = async () => {
  if (!map.value) return
  isLoading.value = true
  const wayIdToColorMap = new Map<string, string>()

  // Remove existing layers first
  if (roadLineLayer.value) map.value.removeLayer(roadLineLayer.value as any)
  if (roadPointLayer.value) map.value.removeLayer(roadPointLayer.value as any)
  if (iriHeatmapLayer.value) map.value.removeLayer(iriHeatmapLayer.value as any); // Also remove IRI layer if switching type
  roadLineLayer.value = null
  roadPointLayer.value = null
  iriHeatmapLayer.value = null; // Reset IRI layer ref

  try {
    // --- Load Road Line Data ---
    const lineResponse = await fetch('/road_data.json') // Adjust path if needed
    if (!lineResponse.ok) throw new Error(`Line data HTTP error! status: ${lineResponse.status}`)
    const lineData = await lineResponse.json()
    const lineFeatures = new GeoJSON().readFeatures(lineData, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.value.getView().getProjection(),
    })

    lineFeatures.forEach((feature: any) => {
      const properties = feature.getProperties()
      const wayId = properties['pid']?.toString()
      if (wayId) {
        feature.setId(wayId)
      }
      // Assign colors based on type 'rpci' or 'report'
      if (props.type === 'rpci' || props.type === 'report') {
        const rand = Math.random()
        let assignedColor = rpciColors['default']
        for (let i = 0; i < rpciColorDistribution.length; i++) {
          if (rand <= rpciColorDistribution[i].threshold) {
            assignedColor = rpciColorDistribution[i].color
            break
          }
        }
        feature.set('assigned_rpci_color', assignedColor)
        if (wayId) {
          wayIdToColorMap.set(wayId, assignedColor)
        }
      } else {
        feature.set('assigned_rpci_color', rpciColors['default'])
      }
    })

    const lineSource = new VectorSource<any>({ features: lineFeatures })
    roadLineLayer.value = new VectorLayer({ source: lineSource, style: layerStyleFunction }) // Use main style function
    map.value.addLayer(roadLineLayer.value as any)

    // --- Load Road Point Data (conditionally) ---
    if (props.type === 'road' || props.type === 'rpci') {
      const pointResponse = await fetch('/road_points_5m.json') // Adjust path if needed
      if (!pointResponse.ok)
        throw new Error(`Point data HTTP error! status: ${pointResponse.status}`)
      const pointData = await pointResponse.json()
      const pointFeatures = new GeoJSON().readFeatures(pointData, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.value.getView().getProjection(),
      })

      if (props.type === 'rpci') {
        pointFeatures.forEach((feature: any) => {
          const propsFs = feature.getProperties()
          const parentId = propsFs['parent_way_id']?.toString()
          if (parentId && wayIdToColorMap.has(parentId)) {
            feature.set('assigned_rpci_color', wayIdToColorMap.get(parentId))
          } else {
            feature.set('assigned_rpci_color', rpciColors['default'])
          }
        })
      } else { // 'road' mode
        pointFeatures.forEach((feature: any) => {
          feature.set('assigned_rpci_color', rpciColors['default'])
        })
      }

      const pointSource = new VectorSource<any>({ features: pointFeatures })
      roadPointLayer.value = new VectorLayer({
        source: pointSource,
        style: layerStyleFunction, // Use main style function
        renderBuffer: 20,
      })
      map.value.addLayer(roadPointLayer.value as any)
    } else {
      roadPointLayer.value = null
    }
  } catch (error) {
    console.error(`Error loading layers: ${error}`)
    alert(`Error loading layers: ${error}`)
  } finally {
    isLoading.value = false
  }
}


// --- makeIriLayer Function (from previous step, ensure it uses map.value) ---
const makeIriLayer = async (mapInstance: OLMap | null, geojsonPath = '/iri_data.json') => {
  // Added mapInstance type check
  if (!mapInstance || !(mapInstance instanceof OLMap)) {
    console.error("Invalid or null Map instance provided to makeIriLayer:", mapInstance);
    alert('유효한 지도 객체가 전달되지 않았습니다.');
    return;
  }

  console.log("Attempting to add IRI layer...");
  isLoading.value = true;

  // Remove previous IRI layer if it exists
  if (iriHeatmapLayer.value) {
    mapInstance.removeLayer(iriHeatmapLayer.value as any);
    iriHeatmapLayer.value = null
  }
  if (iriTooltipOverlay.value && iriTooltipContent.value) {
    iriTooltipOverlay.value.setPosition(undefined);
    iriTooltipContent.value.innerHTML = '';
    document.getElementById('iri-tooltip')?.classList.remove('ol-tooltip-visible');
  }
  selectedWayId.value = null

  try {
    const response = await fetch(geojsonPath);
    if (!response.ok) {
      throw new Error(`IRI GeoJSON fetch error! status: ${response.status}`);
    }
    const iriGeoJsonData = await response.json();

    // --- GeoJSON LineString -> Point Features for Heatmap ---
    const heatmapPoints: Feature<Point>[] = [];
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    const features = new GeoJSON().readFeatures(iriGeoJsonData); // 원본 피처 읽기

    features.forEach((feature: FeatureLike) => {
      const geometry = feature.getGeometry();
      const properties = feature.getProperties();
      let iriValue = properties['iri'];

      if (geometry && geometry.getType() === 'LineString' && typeof iriValue === 'number') {
        // IRI 값 클램핑 (0 ~ 10)
        const clampedIri = Math.max(0, Math.min(10, iriValue));

        // LineString의 모든 좌표를 Point 피처로 변환
        const coordinates = (geometry as LineString).getCoordinates();
        coordinates.forEach((coord: Coordinate) => {
          // 지도 좌표계로 변환
          const mapCoord = fromLonLat(coord, mapInstance.getView().getProjection());

          // 중심 계산용 좌표 업데이트
          minLon = Math.min(minLon, coord[0]);
          maxLon = Math.max(maxLon, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);

          // Point 피처 생성 및 weight 설정
          const pointFeature = new Feature({
            geometry: new Point(mapCoord),
            // 'weight' 속성에 클램핑된 IRI 값 저장 (Heatmap 레이어에서 사용)
            weight: clampedIri
            // 필요시 다른 속성도 추가 가능: original_iri: iriValue
          });
          heatmapPoints.push(pointFeature);
        });
      }
    });
    // --- Point Feature 변환 완료 ---

    // --- 지도 센터 계산 ---
    if (minLon !== Infinity) {
      const centerLon = (minLon);
      const centerLat = (minLat);
      iriCenter.value = fromLonLat([centerLon, centerLat]);
      console.log("IRI Center calculated:", [centerLon, centerLat]);
    } else {
      console.warn("Could not calculate center from IRI data, using default.");
      iriCenter.value = fromLonLat([127.128, 37.378]);
    }
    // --- 센터 계산 완료 ---


    if (heatmapPoints.length === 0) {
      console.warn("No valid points generated for IRI heatmap.");
      isLoading.value = false;
      return; // 피처 없으면 종료
    }

    // Create Vector Source with the points
    const iriHeatmapSource = new VectorSource({
      features: heatmapPoints
    });

    // Create Heatmap Layer
    iriHeatmapLayer.value = new HeatmapLayer({
      source: iriHeatmapSource,
      blur: 10,   // 흐림 효과 정도 (조정 필요)
      radius: 5,  // 각 포인트의 영향 반경 (조정 필요)
      // weight 함수: 피처의 'weight' 속성 반환 (0~10 값)
      // gradient 는 0~1 범위 값에 매핑되므로 weight 값을 10으로 나눠 정규화
      weight: (feature: FeatureLike) => {
        const weight = feature.get('weight');
        return (typeof weight === 'number') ? weight / 10 : 0; // 0-1 범위로 정규화
      },
      gradient: iriHeatmapGradient, // 정의된 7단계 그래디언트 사용
      zIndex: 5 // Optional: Adjust layer stacking order
    });

    isLoading.value = false; // 로딩 완료 시점 변경

    // Add the heatmap layer to the map
    mapInstance.addLayer(iriHeatmapLayer.value as any);
    console.log("IRI Heatmap layer added successfully.");

    // Move map to the center of the IRI data
    mapInstance.getView().animate({ center: iriCenter.value, zoom: 15, duration: MAP_DURATION });


  } catch (error) {
    console.error(`Error creating IRI heatmap layer: ${error}`);
    alert(`IRI 히트맵 레이어 로딩 오류: ${error}`);
    if (iriHeatmapLayer.value) { // Cleanup potential partial layer
      iriHeatmapLayer.value = null;
    }
  } finally {
    isLoading.value = false
  }
}


// --- Map Event Handlers ---
const handleResetCenter = () => {
  map.value?.getView().animate({ center: center, zoom: ZOOM_DEFAULT, duration: MAP_DURATION })
}

const vworldTileLayer = new TileLayer({
  // source: new XYZ({
  //   url: 'https://api.vworld.kr/req/wmts/1.0.0/1FD1DD92-D087-3EE3-9739-7459C1D23F72/Base/{z}/{y}/{x}.png',
  // }),
  source: new OSM()
})

const customInteractions = defaultInteractions().extend([
  new MouseWheelZoom({
    constrainResolution: true,
  }),
])

const iriTooltipOverlay = ref<any>(null); // **** IRI 툴팁 오버레이 ref ****
const iriTooltipContent = ref<HTMLElement | null>(null); // **** IRI 툴팁 내용 요소 ref ****

// --- OpenLayers Map Initialization and Event Listeners ---
onMounted(async () => {
  if (!mapContainer.value) return
  const tooltipElement = document.getElementById('iri-tooltip');
  iriTooltipContent.value = document.getElementById('iri-tooltip-content');

  if (!tooltipElement || !iriTooltipContent.value) {
    console.error("Tooltip element not found!");
    return;
  }
  // Create IRI Tooltip Overlay (but it won't be used by heatmap clicks)
  iriTooltipOverlay.value = new Overlay({
    element: tooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
  })

  map.value = new OLMap({
    target: mapContainer.value,
    layers: [vworldTileLayer],
    view: new View({ center, zoom: ZOOM_DEFAULT, minZoom: ZOOM_MINLEVEL, maxZoom: ZOOM_MAXLEVEL }),
    interactions: customInteractions,
    overlays: [iriTooltipOverlay.value] // 오버레이는 추가하지만 히트맵에서 사용 X
  });

  // Load initial layers (road/rpci/etc.) based on props.type
  if (props.type) {
    await loadLayers();
  }

  // --- Single Click Handler (Updated for IRI) ---
  map.value?.on('singleclick', (e: MapBrowserEvent<UIEvent>) => {
    if (props.type === 'cover' || props.type === 'report') {
      if (iriTooltipOverlay.value) { // 기존 툴팁 숨기기
        iriTooltipOverlay.value.setPosition(undefined);
      }
      if (selectedWayId.value) { // 기존 선택 해제 (스타일 초기화)
        selectedWayId.value = null;
        iriHeatmapLayer.value?.getSource()?.changed();
      }
      return
    }

    let clickedFeatureInstance: any = null; // Use FeatureLike type
    let clickedLayer: VectorLayer<any> | null = null;    // Type the layer

    // Define layers that are clickable based on the current mode (props.type)
    const clickableLayers: VectorLayer<any>[] = [];
    if (roadLineLayer.value) clickableLayers.push(roadLineLayer.value as any);
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      clickableLayers.push(roadPointLayer.value as any);
    }

    map.value?.forEachFeatureAtPixel(
      e.pixel,
      (feature, layer) => { // Correct types inferred or use FeatureLike, Layer
        clickedFeatureInstance = feature;
        clickedLayer = layer as VectorLayer<any>; // Cast layer
        return true; // Stop after first hit
      },
      {
        layerFilter: (layer) => clickableLayers.includes(layer as VectorLayer<any>), // Cast layer
        // hitTolerance: 4
      }
    )

    let clickedWayId: string | null = null;
    let clickedPointCoords: number[] | null = null;
    let isPointClick = false;
    let isLineClick = false;
    let lineFirstCoord: number[] | null = null;
    let isIriClick = false; // Flag for IRI click

    if (clickedFeatureInstance) {
      const geometry = clickedFeatureInstance.getGeometry();
      const type = geometry?.getType();
      const properties = clickedFeatureInstance.getProperties();

      if (type === 'LineString') { // Handle road/rpci lines
        clickedWayId = clickedFeatureInstance.getId()?.toString() ?? null; // Use feature ID
        isLineClick = true;
        lineFirstCoord = (geometry as LineString).getFirstCoordinate();
      } else if (type === 'Point') { // Handle road/rpci points
        clickedWayId = properties['parent_way_id']?.toString() ?? null;
        clickedPointCoords = (geometry as Point).getCoordinates(); // Use Point type assertion
        isPointClick = true;
      }
    }

    // --- Update Selection State ---
    let selectionChanged = false;
    if (selectedWayId.value !== clickedWayId || !compareCoordinates(selectedPointCoords.value, clickedPointCoords)) {
      selectedWayId.value = clickedWayId;
      selectedPointCoords.value = clickedPointCoords; // Will be null if a line was clicked
      selectionChanged = true;
    }

    // --- Refresh Layer Styles if Selection Changed ---
    if (selectionChanged) {
      roadLineLayer.value?.getSource()?.changed();
      roadPointLayer.value?.getSource()?.changed();
    }

    // --- Handle Actions Based on Click ---
    if (clickedFeatureInstance) {
      const properties = clickedFeatureInstance.getProperties();
      if (properties.geometry) {
        delete properties.geometry; // Clean properties before emitting
      }

      if (isIriClick) {
        // Emit properties for IRI feature
        console.log("Emitting IRI feature properties:", properties);
        // emit('select-feature', properties);
        // // Optional: Animate map view for IRI click (e.g., zoom to line center or start)
        if (map.value && lineFirstCoord) {
          map.value.getView().animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION });
        }
      } else if (isPointClick && (props.type === 'road' || props.type === 'rpci')) {
        // Emit properties for road/rpci point
        emit('select-feature', properties);
        // Animate to point
        if (map.value && clickedPointCoords) {
          map.value.getView().animate({ center: clickedPointCoords, duration: MAP_DURATION });
        }
      } else if (isLineClick && (props.type === 'road' || props.type === 'rpci')) {
        // Animate to line start/center for road/rpci line
        if (map.value && lineFirstCoord) {
          map.value.getView().animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION });
        }
        // Potentially emit line properties if needed for road/rpci line clicks
        // emit('select-feature', properties);
      }
    } else { // Clicked outside any feature
      if (selectedWayId.value !== null || selectedPointCoords.value !== null) {
        selectedWayId.value = null;
        selectedPointCoords.value = null;
        roadLineLayer.value?.getSource()?.changed();
        roadPointLayer.value?.getSource()?.changed();
        selectionChanged = true; // Indicate deselection happened
      }
      // Close drawer only if something was deselected or if the specific mode requires it
      if (selectionChanged || props.type === 'road' || props.type === 'rpci') {
        emit('close-drawer');
      }
    }
  });


  // --- Pointer Move Handler (Updated for IRI) ---
  map.value?.on('pointermove', (e: MapBrowserEvent<UIEvent>) => {
    if (e.dragging) return;
    const pixel = map.value?.getEventPixel(e.originalEvent);
    if (!pixel || !map.value) return;

    // IRI Hover Handling Update Start
    const hoverableLayers: VectorLayer<any>[] = []; // Explicitly type

    if (roadLineLayer.value) hoverableLayers.push(roadLineLayer.value as any);
    // Only add point layer if relevant for the mode and exists
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      hoverableLayers.push(roadPointLayer.value as any);
    }
    // IRI Hover Handling Update End


    const hit = map.value.forEachFeatureAtPixel(pixel, (f, l) => true, {
      layerFilter: (l) => hoverableLayers.includes(l as VectorLayer<any>),
      // hitTolerance: 2,
    });

    const targetElement = map.value.getTargetElement() as HTMLElement | undefined;
    if (targetElement) {
      // Allow pointer cursor for IRI type as well
      if (props.type === 'cover' || props.type === 'report') {
        targetElement.style.cursor = '';
      } else { // road, rpci, iri
        targetElement.style.cursor = hit ? 'pointer' : '';
      }
    }
  });

  // --- Resolution Change Handler (remains the same) ---
  map.value?.getView().on('change:resolution', () => {
    roadLineLayer.value?.getSource()?.changed()
    roadPointLayer.value?.getSource()?.changed()// Also refresh IRI layer on zoom
  })

  // --- Window Event Listeners Setup (remains the same, but check the IRI listener call) ---
  window.addEventListener('reset-map-center', handleResetCenter)
  window.addEventListener('zoom-in-map', () => {
    const currentZoom = map.value?.getView().getZoom()
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION })
  })
  window.addEventListener('zoom-out-map', () => {
    const currentZoom = map.value?.getView().getZoom()
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION })
  })

  // Ensure map.value is passed correctly here
  window.addEventListener('show-iri-layer', async () => {
    await makeIriLayer(map.value as any); // Pass the reactive map ref's value
  });

  window.addEventListener('hide-iri-layer', () => {
    if (iriHeatmapLayer.value) {
      map.value?.removeLayer(iriHeatmapLayer.value as any);
      iriHeatmapLayer.value = null;
    }
  });
})

// --- onBeforeUnmount (remove iri listener properly) ---
onBeforeUnmount(() => {
  if (map.value) {
    map.value.setTarget(undefined)
    // map.value = null // Avoid setting ref to null directly if it might be needed elsewhere briefly
  }
  // Remove specific listeners added in onMounted
  window.removeEventListener('reset-map-center', handleResetCenter);
  // Define the IRI handler separately to remove it correctly
  const iriHandler = async () => { await makeIriLayer(map.value as any); }; // Simplified, may need exact reference
  window.removeEventListener('show-iri-layer', iriHandler);
  window.removeEventListener('hide-iri-layer', iriHandler);
  // Consider removing zoom listeners too if added dynamically
  window.removeEventListener('zoom-in-map', () => { })
  window.removeEventListener('zoom-out-map', () => { });
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
/* Styles remain the same */
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
  /* 어두운 반투명 배경 */
  color: white;
  /* 흰색 텍스트 */
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  white-space: pre-wrap;
  /* 줄바꿈 및 공백 유지 */
  pointer-events: none;
  /* 툴팁 위로 마우스 이벤트가 통과하도록 */
  transform: translate(-50%, -110%);
  /* 위치 조정 (위쪽 중앙) */
  transition: opacity 0.2s;
  opacity: 0;
  /* 기본적으로 숨김 */
  z-index: 10;
  /* 다른 요소 위에 오도록 */
  border: 1px solid white;
}

.ol-tooltip:empty {
  /* 내용 없을 때 숨김 */
  opacity: 0;
}

.ol-tooltip-visible {
  /* 내용 있을 때 표시 */
  opacity: 1;
}
</style>
