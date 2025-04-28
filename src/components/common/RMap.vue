<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
import { MapBrowserEvent } from 'ol'
import { defaults as defaultInteractions, MouseWheelZoom } from 'ol/interaction'
import { Cog } from 'lucide-vue-next'
import type LineString from 'ol/geom/LineString'
import type Point from 'ol/geom/Point'
import type { FeatureLike } from 'ol/Feature'

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
  type?: 'road' | 'cover' | 'rpci' | 'report' | null
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<OLMap | null>(null)
const roadLineLayer = ref<VectorLayer<VectorSource<LineString | any>> | null>(null)
const roadPointLayer = ref<VectorLayer<VectorSource<Point | any>> | null>(null)
const selectedWayId = ref<string | null>(null)
const selectedPointCoords = ref<any>(null)
const isLoading = ref(false)

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

const layerStyleFunction = (feature: FeatureLike): Style | Style[] | undefined => {
  const currentZoom = map.value?.getView().getZoom()
  if (!currentZoom) return undefined
  const geometry: any = feature.getGeometry()
  if (!geometry) return undefined
  const featureType = geometry.getType()
  const properties = feature.getProperties()
  const featureWayId =
    featureType === 'LineString' ? feature.getId() : properties['parent_way_id']?.toString()

  const isSelectedLine =
    selectedWayId.value != null && selectedWayId.value === featureWayId?.toString()
  let isSelectedPoint = false
  if (featureType === 'Point' && selectedPointCoords.value) {
    const currentCoords = (geometry as Point).getCoordinates() // 타입 단언
    isSelectedPoint = compareCoordinates(currentCoords, selectedPointCoords.value)
  }

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
        // --- RPCI 선 스타일 ---
        const mainStrokeWidth = isSelectedLine ? 10 : 6
        const mainOpacity = isSelectedLine ? selectedOpacity : defaultOpacity
        const mainColor = hexToRgba(assignedColorHex, mainOpacity)

        const mainStyle = new Style({
          stroke: new Stroke({ color: mainColor, width: mainStrokeWidth }),
          zIndex: isSelectedLine ? 1 : 0, // 선택 시 위에 오도록
        })

        if (isSelectedLine && currentZoom < ZOOM_THRESHOLD) {
          // 선택되었고, 줌 아웃 상태일 때만 테두리 추가
          const borderStyle = new Style({
            stroke: new Stroke({
              color: BORDER_COLOR,
              width: mainStrokeWidth + BORDER_EXTRA_WIDTH,
            }),
            zIndex: 0, // 테두리는 아래에
          })
          return [borderStyle, mainStyle] // 배열 반환
        } else if (currentZoom < ZOOM_THRESHOLD) {
          // 선택 안되었고, 줌 아웃 상태
          return mainStyle // 기본 스타일만 반환
        } else {
          return undefined // 줌 인 상태에서는 선 숨김
        }
      } else if (featureType === 'Point') {
        // --- RPCI 점 스타일 ---
        const currentPointRadius = isSelectedPoint ? 10 : 6
        const isRelated = !isSelectedPoint && isSelectedLine // 선택된 점 아니고, 관련 선 위의 점
        // 점 색상은 선택 여부와 관계없이 RPCI 색상, 투명도는 관련 여부로 결정
        const pointColor = hexToRgba(
          assignedColorHex,
          isSelectedPoint || isRelated ? selectedOpacity : pointDefaultOpacity,
        )

        if (currentZoom >= ZOOM_THRESHOLD) {
          // 줌 인 상태에서만 점 표시
          return new Style({
            image: new Circle({
              radius: currentPointRadius,
              fill: new Fill({ color: isSelectedPoint ? 'rgba(255, 0, 0, 1.0)' : pointColor }),
            }),
            zIndex: isSelectedPoint ? 2 : isRelated ? 1 : 0,
          })
        } else if (isSelectedPoint) {
          // 줌 아웃 상태에서는 선택된 점만 표시
          return new Style({
            image: new Circle({
              radius: currentPointRadius,
              fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }), // 불투명
            }),
            zIndex: 2,
          })
        } else {
          return undefined // 나머지 점 숨김
        }
      } else {
        return undefined
      }
    case 'road':
    default:
      if (currentZoom < ZOOM_THRESHOLD) {
        // 줌 아웃 시 선 표시
        if (featureType === 'LineString') {
          if (isSelectedLine) {
            // roadSelectedLineBorderStyle와 roadSelectedLineStyle을 배열로 반환
            return [roadSelectedLineBorderStyle, roadSelectedLineStyle]
          } else {
            return roadDefaultLineStyle
          }
        } else if (featureType === 'Point' && isSelectedPoint) {
          // 선택된 점만 표시
          return roadSelectedPointStyle
        } else {
          return undefined // 나머지 숨김
        }
      } else {
        // 줌 인 시 점 표시
        if (featureType === 'Point') {
          if (isSelectedPoint) {
            return roadSelectedPointStyle
          } else if (isSelectedLine) {
            // isSelectedLine은 isLineRelatedSelected와 같음
            return roadRelatedPointStyle
          } else {
            return roadDefaultPointStyle
          }
        } else {
          // 선 숨김
          return undefined
        }
      }
  }
}

const mapStyle = computed(() => {
  return {
    right: props.rightDrawer ? '25%' : '0px',
    left: props.type === 'cover' ? '25%' : '0px',
    transition: 'all 0.3s ease',
  }
})
const center = fromLonLat([127.128, 37.378])

const loadLayers = async () => {
  if (!map.value) return
  isLoading.value = true
  const wayIdToColorMap = new Map<string, string>()

  if (roadLineLayer.value) map.value.removeLayer(roadLineLayer.value as any)
  if (roadPointLayer.value) map.value.removeLayer(roadPointLayer.value as any)
  roadLineLayer.value = null
  roadPointLayer.value = null

  try {
    const lineResponse = await fetch('/road_data.json')
    if (!lineResponse.ok) throw new Error(`Line data HTTP error! status: ${lineResponse.status}`)
    const lineData = await lineResponse.json()
    const lineFeatures = new GeoJSON().readFeatures(lineData, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.value.getView().getProjection(),
    })

    lineFeatures.forEach((feature: any) => {
      const properties = feature.getProperties()
      // --- GeoJSON properties의 'pid'를 피처 ID로 설정 ---
      const wayId = properties['pid']?.toString() // pid 사용 확인
      if (wayId) {
        feature.setId(wayId) // Feature 객체에 ID 설정
      }
      // --- ID 설정 끝 ---

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
          // 설정된 wayId 사용
          wayIdToColorMap.set(wayId, assignedColor)
        }
      } else {
        // 다른 모드에서도 기본 색상 설정 (스타일 함수 오류 방지)
        feature.set('assigned_rpci_color', rpciColors['default'])
      }
    })

    const lineSource = new VectorSource<any>({ features: lineFeatures })
    roadLineLayer.value = new VectorLayer({ source: lineSource, style: layerStyleFunction })
    map.value.addLayer(roadLineLayer.value as any)

    if (props.type === 'road' || props.type === 'rpci') {
      const pointResponse = await fetch('/road_points_5m.json')
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
          const parentId = propsFs['parent_way_id']?.toString() // 부모 ID 가져오기
          if (parentId && wayIdToColorMap.has(parentId)) {
            feature.set('assigned_rpci_color', wayIdToColorMap.get(parentId))
          } else {
            feature.set('assigned_rpci_color', rpciColors['default'])
          }
        })
      } else {
        pointFeatures.forEach((feature: any) => {
          feature.set('assigned_rpci_color', rpciColors['default']) // road 모드 기본 색상
        })
      }

      const pointSource = new VectorSource<any>({ features: pointFeatures })
      roadPointLayer.value = new VectorLayer({
        source: pointSource,
        style: layerStyleFunction,
        renderBuffer: 20, // 점이 많을 경우 renderBuffer 늘리기 고려
      })
      map.value.addLayer(roadPointLayer.value as any) // as any 제거 가능
    } else {
      roadPointLayer.value = null
    }
  } catch (error) {
    alert(`Error loading layers: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const handleResetCenter = () => {
  map.value?.getView().animate({ center: center, zoom: ZOOM_DEFAULT, duration: MAP_DURATION })
}

const vworldTileLayer = new TileLayer({
  source: new XYZ({
    url: 'https://api.vworld.kr/req/wmts/1.0.0/1FD1DD92-D087-3EE3-9739-7459C1D23F72/Base/{z}/{y}/{x}.png',
  }),
})

const customInteractions = defaultInteractions().extend([
  new MouseWheelZoom({
    constrainResolution: true,
  }),
])

onMounted(async () => {
  if (!mapContainer.value) return
  map.value = new OLMap({
    target: mapContainer.value,
    layers: [vworldTileLayer],
    view: new View({ center, zoom: ZOOM_DEFAULT, minZoom: ZOOM_MINLEVEL, maxZoom: ZOOM_MAXLEVEL }),
    interactions: customInteractions,
  })
  await loadLayers()

  map.value?.on('singleclick', (e: MapBrowserEvent<UIEvent>) => {
    if (props.type === 'cover' || props.type === 'report') {
      return
    }

    let clickedFeatureInstance: any = null
    let clickedLayer: any = null
    const clickableLayers = [roadLineLayer.value]
    if (roadPointLayer.value) {
      clickableLayers.push(roadPointLayer.value)
    }

    map.value?.forEachFeatureAtPixel(
      e.pixel,
      (feature: any, layer: any) => {
        clickedFeatureInstance = feature
        clickedLayer = layer
        return true
      },
      { layerFilter: (layer: any) => clickableLayers.includes(layer), hitTolerance: 4 },
    )

    let clickedWayId: string | null = null
    let clickedPointCoords: number[] | null = null
    let isPointClick = false
    let isLineClick = false
    let lineFirstCoord: number[] | null = null

    if (clickedFeatureInstance) {
      const propsFs = clickedFeatureInstance.getProperties()
      const geometry = clickedFeatureInstance.getGeometry()
      const type = geometry?.getType()
      if (type === 'LineString') {
        clickedWayId = propsFs['pid']
        isLineClick = true
        clickedPointCoords = null
        lineFirstCoord = geometry.getFirstCoordinate()
      } else if (type === 'Point') {
        clickedWayId = propsFs['parent_way_id']
        clickedPointCoords = geometry.getCoordinates()
        isPointClick = true
      }
    }

    if (
      selectedWayId.value !== clickedWayId ||
      !compareCoordinates(selectedPointCoords.value, clickedPointCoords)
    ) {
      selectedWayId.value = clickedWayId
      selectedPointCoords.value = clickedPointCoords
      roadLineLayer.value?.getSource()?.changed()
      roadPointLayer.value?.getSource()?.changed()
    }

    if (clickedFeatureInstance) {
      if (isLineClick && map.value && lineFirstCoord) {
        map.value
          .getView()
          .animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION })
      } else if (isPointClick && map.value && clickedPointCoords) {
        map.value.getView().animate({ center: clickedPointCoords, duration: MAP_DURATION })
        const properties = clickedFeatureInstance.getProperties()
        if (properties.geometry) {
          delete properties.geometry
        }
        emit('select-feature', properties)
      }
    } else {
      if (selectedWayId.value !== null || selectedPointCoords.value !== null) {
        selectedWayId.value = null
        selectedPointCoords.value = null
        roadLineLayer.value?.getSource()?.changed()
        roadPointLayer.value?.getSource()?.changed()
      }
      if (props.type === 'road' || props.type === 'rpci') {
        emit('close-drawer')
      }
    }
  })

  map.value?.on('pointermove', (e: MapBrowserEvent<UIEvent>) => {
    if (e.dragging) return
    const pixel = map.value?.getEventPixel(e.originalEvent)
    if (!pixel || !map.value) return

    const hoverableLayers: any[] = []
    if (roadLineLayer.value) hoverableLayers.push(roadLineLayer.value)
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      hoverableLayers.push(roadPointLayer.value)
    }

    const hit = map.value.forEachFeatureAtPixel(pixel, (f, l) => true, {
      layerFilter: (l: any) => hoverableLayers.includes(l),
      hitTolerance: 2,
    })
    const targetElement = map.value.getTargetElement() as HTMLElement | undefined
    if (targetElement) {
      if (props.type === 'cover' || props.type === 'report') {
        targetElement.style.cursor = ''
      } else {
        targetElement.style.cursor = hit ? 'pointer' : ''
      }
    }
  })

  map.value?.getView().on('change:resolution', () => {
    roadLineLayer.value?.getSource()?.changed()
    roadPointLayer.value?.getSource()?.changed()

    console.log(map.value?.getView().getZoom())
  })

  window.addEventListener('reset-map-center', handleResetCenter)
  window.addEventListener('zoom-in-map', () => {
    const currentZoom = map.value?.getView().getZoom()
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION })
  })
  window.addEventListener('zoom-out-map', () => {
    const currentZoom = map.value?.getView().getZoom()
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION })
  })
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.setTarget(undefined)
    map.value = null
  }
  window.removeEventListener('reset-map-center', handleResetCenter)
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
</style>
