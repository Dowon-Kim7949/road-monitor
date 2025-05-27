import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import HeatmapLayer from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { Feature, MapBrowserEvent } from 'ol'
import { getLength as getGeodesicLength } from 'ol/sphere'
import type LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import type { FeatureLike } from 'ol/Feature'
import type { Coordinate } from 'ol/coordinate'
import OSM from 'ol/source/OSM'

export const MAP_DURATION = 0
export const ZOOM_THRESHOLD = 19
export const ZOOM_DEFAULT = 17
export const ZOOM_MINLEVEL = 10
export const ZOOM_MAXLEVEL = 21
export const BORDER_COLOR = 'rgba(0, 0, 0, 0.8)'
export const BORDER_EXTRA_WIDTH = 4
export const IRI_HEATMAP_GRADIENT = [
  '#0000ff',
  '#00ffff',
  '#00ff00',
  '#ffff00',
  '#ffaa00',
  '#ff4500',
  '#ff0000',
]
export const RPCI_COLORS: { [key: string]: string } = {
  green: '#00CC25',
  yellow: '#FEFD33',
  orange: '#FF2B06',
  darkRed: '#AB1803',
  darkGreen: '#007e12',
  default: '#808080',
}

export const RPCI_COLOR_DISTRIBUTION = [
  { color: RPCI_COLORS.green, threshold: 0.6 },
  { color: RPCI_COLORS.yellow, threshold: 0.9 },
  { color: RPCI_COLORS.orange, threshold: 0.95 },
  { color: RPCI_COLORS.darkRed, threshold: 0.98 },
  { color: RPCI_COLORS.darkGreen, threshold: 1.0 },
]

export const ROAD_SELECTEDLINESTYLE = new Style({
  stroke: new Stroke({ color: 'rgba(80, 80, 80, 1)', width: 10 }),
})
export const ROAD_DEFAULTLINESTYLE = new Style({
  stroke: new Stroke({ color: 'rgba(80, 80, 80, 0.7)', width: 7 }),
})
export const ROAD_SELECTEDPOINTSTYLE = new Style({
  image: new Circle({ radius: 10, fill: new Fill({ color: 'rgba(255, 0, 0, 1.0)' }) }),
  zIndex: 2,
})
export const ROAD_RELATEDPOINTSTYLE = new Style({
  image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(100, 100, 100, 1.0)' }) }),
  zIndex: 1,
})
export const ROAD_DEFAULTPOINTSTYLE = new Style({
  image: new Circle({ radius: 6, fill: new Fill({ color: 'rgba(80, 80, 80, 0.5)' }) }),
})
export const ROAD_SELECTEDLINEBORDERSTYLE = new Style({
  stroke: new Stroke({ color: BORDER_COLOR, width: 10 + BORDER_EXTRA_WIDTH }),
  zIndex: 0,
})

const vworldTileLayer = new TileLayer({ source: new OSM() })
const bridgeStyle = new Style({
  stroke: new Stroke({ color: 'rgba(0,0,255,1)', width: 4 }),
  fill: new Fill({ color: 'rgba(0,0,255, 0.5)' }),
})

/**
 *
 * @param coords1
 * @param coords2
 * @returns
 */
export const compareCoordinates = (coords1: any, coords2: any): boolean => {
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

/**
 *
 * @param hex
 * @param alpha
 * @returns
 */
export const hexToRgba = (hex: string, alpha: number): string => {
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

/**
 *
 * @param container
 * @param center
 * @param onZoomChange
 * @returns
 */
export const initMap = (
  container: HTMLElement,
  center: any,
  onZoomChange: (zoom: number) => void,
): OLMap => {
  const map = new OLMap({
    target: container,
    layers: [vworldTileLayer],
    view: new View({
      center,
      zoom: ZOOM_DEFAULT,
      minZoom: ZOOM_MINLEVEL,
      maxZoom: ZOOM_MAXLEVEL,
    }),
  })

  map.getView().on('change:resolution', () => {
    onZoomChange(map.getView().getZoom()!)
  })
  return map
}

/**
 *
 * @param feature
 * @param map
 * @param propsType
 * @param selectedWayId
 * @param selectedPointCoords
 * @returns
 */
export const layerStyleFunction = (
  feature: FeatureLike,
  map: OLMap,
  propsType: string,
  selectedWayId: string | null,
  selectedPointCoords: [number, number] | null,
): Style | Style[] | undefined => {
  const currentZoom = map.getView().getZoom() ?? 0
  if (currentZoom === 0) return undefined

  const props = feature.getProperties()
  const geom = feature.getGeometry?.()
  if (!geom) return undefined

  // zoom 레벨에 따른 필터링
  if (
    (propsType === 'road' || propsType === 'surrounding' || propsType === 'rpci') &&
    currentZoom <= 15.5 &&
    (geom.getType() === 'LineString' || geom.getType() === 'MultiLineString')
  ) {
    const highway = props.highway as string
    if (!['primary', 'secondary', 'motorway', 'tertiary'].includes(highway)) {
      return undefined
    }
  }

  // 선택 여부 계산
  const featureType = geom.getType()
  const featureWayId =
    featureType === 'LineString' || featureType === 'MultiLineString'
      ? feature.getId()?.toString()
      : (props.parent_way_id as string | undefined)
  const isSelectedLine = selectedWayId != null && selectedWayId === featureWayId?.toString()

  let isSelectedPoint = false
  if (featureType === 'Point' && selectedPointCoords) {
    const coords = (geom as any).getCoordinates() as [number, number]
    isSelectedPoint = compareCoordinates(coords, selectedPointCoords)
  }

  // 스타일 분기
  switch (propsType) {
    case 'cover':
      return featureType === 'LineString' || featureType === 'MultiLineString'
        ? ROAD_DEFAULTLINESTYLE
        : undefined

    case 'report':
      if (featureType !== 'LineString' && featureType !== 'MultiLineString') return undefined
      const reportColor = hexToRgba(
        (props.assigned_rpci_color as string) || RPCI_COLORS.default,
        0.7,
      )
      return new Style({
        stroke: new Stroke({ color: reportColor, width: 5 }),
      })

    case 'rpci':
      const assignedHex = (props.assigned_rpci_color as string) || RPCI_COLORS.default
      const selOp = 1.0,
        defOp = 0.7,
        ptDefOp = 0.6

      if (featureType === 'LineString' || featureType === 'MultiLineString') {
        const sw = isSelectedLine ? 10 : 6
        const op = isSelectedLine ? selOp : defOp
        const mainColor = hexToRgba(assignedHex, op)
        const mainStyle = new Style({
          stroke: new Stroke({ color: mainColor, width: sw }),
          zIndex: isSelectedLine ? 1 : 0,
        })

        if (isSelectedLine && currentZoom < ZOOM_THRESHOLD) {
          const border = new Style({
            stroke: new Stroke({
              color: BORDER_COLOR,
              width: sw + BORDER_EXTRA_WIDTH,
            }),
            zIndex: 0,
          })
          return [border, mainStyle]
        }
        return currentZoom < ZOOM_THRESHOLD ? mainStyle : undefined
      }

      if (featureType === 'Point') {
        if (currentZoom < ZOOM_THRESHOLD && !isSelectedPoint && !isSelectedLine) {
          return undefined
        }
        const radius = isSelectedPoint ? 10 : 6
        const isRel = !isSelectedPoint && isSelectedLine
        const col =
          isSelectedPoint || isRel ? hexToRgba(assignedHex, selOp) : hexToRgba(assignedHex, ptDefOp)
        return new Style({
          image: new Circle({
            radius,
            fill: new Fill({ color: isSelectedPoint ? 'rgba(255,0,0,1)' : col }),
          }),
          zIndex: isSelectedPoint ? 2 : isRel ? 1 : 0,
        })
      }
      return undefined

    case 'road':
    case 'surrounding':
    default:
      if (currentZoom < ZOOM_THRESHOLD) {
        if (featureType === 'LineString' || featureType === 'MultiLineString') {
          return isSelectedLine
            ? [ROAD_SELECTEDLINEBORDERSTYLE, ROAD_SELECTEDLINESTYLE]
            : ROAD_DEFAULTLINESTYLE
        }
        if (featureType === 'Point' && isSelectedPoint) {
          return ROAD_SELECTEDPOINTSTYLE
        }
        return undefined
      } else {
        if (featureType === 'Point') {
          if (isSelectedPoint) return ROAD_SELECTEDPOINTSTYLE
          else if (isSelectedLine) return ROAD_RELATEDPOINTSTYLE
          return ROAD_DEFAULTPOINTSTYLE
        }
        return undefined
      }
  }
}

/**
 *
 * @param map
 * @returns
 */
export const loadBridgeLayer = async (map: OLMap): Promise<VectorLayer<VectorSource>> => {
  const resp = await fetch('/bridge.geojson')
  if (!resp.ok) throw new Error(`Bridge HTTP ${resp.status}`)
  const data = await resp.json()
  const features = new GeoJSON().readFeatures(data, {
    dataProjection: 'EPSG:4326',
    featureProjection: map.getView().getProjection(),
  })
  const layer = new VectorLayer({
    source: new VectorSource({ features }),
    style: bridgeStyle,
  })
  map.addLayer(layer)
  return layer
}

/**
 *
 * @param map
 * @param propsType
 * @param styleFn
 * @param isLoading
 * @param roadLineLayer
 * @param roadPointLayer
 */
export const loadLayers = async (
  map: OLMap,
  propsType: 'road' | 'cover' | 'rpci' | 'report' | 'surrounding',
  styleFn: (feature: any) => any,
  isLoading: { value: boolean },
  roadLineLayer: { value: VectorLayer | null },
  roadPointLayer: { value: VectorLayer | null },
): Promise<void> => {
  isLoading.value = true
  const wayColorMap = new Map<string, string>()

  // Remove old layers
  if (roadLineLayer.value) map.removeLayer(roadLineLayer.value)
  if (roadPointLayer.value) map.removeLayer(roadPointLayer.value)
  roadLineLayer.value = null
  roadPointLayer.value = null

  try {
    const { features: lines } = await fetch('/filtered.geojson')
      .then((r) => r.json())
      .then((data) => ({
        features: new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: map.getView().getProjection(),
        }),
      }))

    lines.forEach((f) => {
      const pid = f.getProperties().pid?.toString()
      if (pid) f.setId(pid)

      let color = RPCI_COLORS.default
      if (propsType === 'rpci' || propsType === 'report') {
        const rand = Math.random()
        for (const d of RPCI_COLOR_DISTRIBUTION) {
          if (rand <= d.threshold) {
            color = d.color
            break
          }
        }
        if (pid) wayColorMap.set(pid, color)
      }
      f.set('assigned_rpci_color', color)
    })

    // Add line layer
    roadLineLayer.value = new VectorLayer({
      source: new VectorSource({ features: lines }),
      style: styleFn,
    })
    map.addLayer(roadLineLayer.value)

    // Fetch and style point features if needed
    if (['road', 'rpci', 'surrounding'].includes(propsType)) {
      const { features: points } = await fetch('/road_points_5m.geojson')
        .then((r) => r.json())
        .then((data) => ({
          features: new GeoJSON().readFeatures(data, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection(),
          }),
        }))

      points.forEach((f) => {
        const parent = f.getProperties().parent_way_id?.toString() || ''
        const color =
          propsType === 'rpci' && wayColorMap.has(parent)
            ? wayColorMap.get(parent)
            : RPCI_COLORS.default
        f.set('assigned_rpci_color', color)
      })

      roadPointLayer.value = new VectorLayer({
        source: new VectorSource({ features: points }),
        style: styleFn,
        renderBuffer: 20,
      })
      map.addLayer(roadPointLayer.value)
    }
  } catch (e: any) {
    console.log(`Error loading layers: ${e}`)
  } finally {
    isLoading.value = false
  }
}

/**
 *
 * @param mapInstance
 * @param isLoading
 * @param iriHeatmapLayer
 * @param selectedWayId
 * @param iriCenter
 * @param geojsonPath
 * @returns
 */
export const makeIriLayer = async (
  mapInstance: OLMap | null,
  isLoading: { value: boolean },
  iriHeatmapLayer: { value: HeatmapLayer | null },
  selectedWayId: { value: string | null },
  iriCenter: any,
  geojsonPath = '/iri_data.json',
): Promise<void> => {
  if (!mapInstance) {
    alert('유효한 지도 객체가 전달되지 않았습니다.')
    return
  }
  isLoading.value = true
  if (iriHeatmapLayer.value) {
    mapInstance.removeLayer(iriHeatmapLayer.value)
    iriHeatmapLayer.value = null
  }
  selectedWayId.value = null

  try {
    const data = await fetch(geojsonPath).then((r) => r.json())
    const features = new GeoJSON().readFeatures(data)
    const heatPoints: Feature<Point>[] = []
    let minLon = Infinity,
      maxLon = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity

    features.forEach((f: FeatureLike) => {
      const geom = f.getGeometry()
      const iri = f.getProperties().iri
      if (geom?.getType() === 'LineString' && typeof iri === 'number') {
        const weight = Math.max(0, Math.min(10, iri))
        const coords = (geom as LineString).getCoordinates()
        coords.forEach((c: Coordinate) => {
          const proj = fromLonLat(c, mapInstance.getView().getProjection())
          minLon = Math.min(minLon, c[0])
          maxLon = Math.max(maxLon, c[0])
          minLat = Math.min(minLat, c[1])
          maxLat = Math.max(maxLat, c[1])
          heatPoints.push(new Feature({ geometry: new Point(proj), weight }))
        })
      }
    })

    if (!heatPoints.length) {
      isLoading.value = false
      return
    }

    iriCenter.value = [(minLon + maxLon) / 2, (minLat + maxLat) / 2]

    const source = new VectorSource({ features: heatPoints })
    iriHeatmapLayer.value = new HeatmapLayer({
      source,
      blur: 15,
      radius: 5,
      weight: (f) => (f.get('weight') as number) / 10,
      gradient: IRI_HEATMAP_GRADIENT,
      zIndex: 5,
    })
    mapInstance.addLayer(iriHeatmapLayer.value)
    mapInstance
      .getView()
      .animate({ center: fromLonLat(iriCenter.value), zoom: 15, duration: MAP_DURATION })
  } catch (e: any) {
    alert(`IRI 히트맵 레이어 로딩 오류: ${e.message}`)
    iriHeatmapLayer.value = null
  } finally {
    isLoading.value = false
  }
}

/**
 *
 * @param options: object
 * @param map: OLMap
 * @param type: 'road' | 'rpci' | 'report' | 'cover' | 'surrounding'
 * @param roadLineLayer: { value: VectorLayer | null }
 * @param roadPointLayer: { value: VectorLayer | null }
 * @param iriHeatmapLayer?: { value: any | null }
 * @param selectedWayId: { value: string | null }
 * @param selectedPointCoords: { value: [number, number] | null }
 * @param emit: (...args: any[]) => void
 *
 */
export const bindMapInteractions = (options: {
  map: OLMap
  type: 'road' | 'rpci' | 'report' | 'cover' | 'surrounding'
  roadLineLayer: { value: VectorLayer | null }
  roadPointLayer: { value: VectorLayer | null }
  iriHeatmapLayer?: { value: any | null }
  selectedWayId: { value: string | null }
  selectedPointCoords: { value: [number, number] | null }
  emit: (...args: any[]) => void
}) => {
  const { map, type, roadLineLayer, roadPointLayer, selectedWayId, selectedPointCoords, emit } =
    options

  // 클릭 이벤트
  map.on('singleclick', (e: MapBrowserEvent<UIEvent>) => {
    // cover/report 타입은 무조건 닫기
    if (type === 'cover' || type === 'report') {
      emit('close-drawer')
      return
    }

    // 클릭 가능한 레이어 모으기
    const clickable: VectorLayer<any>[] = []
    if (roadLineLayer.value) clickable.push(roadLineLayer.value)
    if ((type === 'road' || type === 'rpci' || type === 'surrounding') && roadPointLayer.value)
      clickable.push(roadPointLayer.value)

    let clicked: any | null = null
    map.forEachFeatureAtPixel(
      e.pixel,
      (f) => {
        clicked = f
        return true
      },
      { layerFilter: (layer) => clickable.includes(layer as any) },
    )

    if (clicked) {
      // 3) feature 타입별 id/coords 추출
      let clickedWayId: string | null = null
      let clickedCoords: [number, number] | null = null
      let isPoint = false,
        isLine = false
      let lineFirst: [number, number] | null = null

      if (clicked) {
        const geom = clicked.getGeometry?.()
        const props = clicked.getProperties()
        if (geom?.getType() === 'LineString' || geom?.getType() === 'MultiLineString') {
          clickedWayId = clicked.getId()?.toString() ?? null
          isLine = true
          lineFirst = (geom as LineString).getFirstCoordinate() as [number, number]
        } else if (geom?.getType() === 'Point') {
          clickedWayId = props.parent_way_id?.toString() ?? null
          clickedCoords = (geom as Point).getCoordinates() as [number, number]
          isPoint = true
        }
      }

      // 4) selection 상태 변경
      const changed =
        selectedWayId.value !== clickedWayId ||
        !compareCoordinates(selectedPointCoords.value, clickedCoords)
      if (changed) {
        selectedWayId.value = clickedWayId
        selectedPointCoords.value = clickedCoords
        roadLineLayer.value?.getSource()?.changed()
        roadPointLayer.value?.getSource()?.changed()
      }

      // 5) drawer 열기/애니메이션
      if (clicked && (isPoint || isLine)) {
        if (isPoint && (type === 'road' || type === 'rpci' || type === 'surrounding')) {
          const road_info = roadLineLayer.value?.getSource()?.getFeatureById(clickedWayId!)
          const geom = road_info.getGeometry() as LineString
          const lengthInMeters = getGeodesicLength(geom, {
            projection: map.getView().getProjection(),
          })
          const LonLat = toLonLat(clickedCoords!)
          const data = {
            lat: LonLat![1],
            lon: LonLat![0],
            roadName: road_info.getProperties().name,
            length: lengthInMeters.toFixed(2),
          }
          emit('select-feature', data)
          map.getView().animate({ center: clickedCoords!, duration: MAP_DURATION })
        } else if (isLine && (type === 'road' || type === 'rpci' || type === 'surrounding')) {
          map
            .getView()
            .animate({ zoom: ZOOM_THRESHOLD, center: lineFirst!, duration: MAP_DURATION })
        }
      }
      return
    }

    // 백그라운드(피처 아님) 클릭 시,
    // 1) 선택 초기화
    selectedWayId.value = null
    selectedPointCoords.value = null
    roadLineLayer.value?.getSource()?.changed()
    roadPointLayer.value?.getSource()?.changed()

    // 2) 항상 닫기 이벤트
    emit('close-drawer')
  })

  // 포인터 무브 이벤트 (hover cursor 변경)
  map.on('pointermove', (e: MapBrowserEvent<UIEvent>) => {
    if (e.dragging) return
    const pixel = map.getEventPixel(e.originalEvent)
    if (!pixel) return
    const hoverable: VectorLayer<any>[] = []
    if (roadLineLayer.value) hoverable.push(roadLineLayer.value)
    if ((type === 'road' || type === 'rpci' || type === 'surrounding') && roadPointLayer.value)
      hoverable.push(roadPointLayer.value)

    const hit = map.forEachFeatureAtPixel(pixel, () => true, {
      layerFilter: (l) => hoverable.includes(l as VectorLayer<any>),
    })
    const el = map.getTargetElement() as HTMLElement
    el.style.cursor = type === 'cover' || type === 'report' ? '' : hit ? 'pointer' : ''
  })

  // moveend 시 리렌더
  map.on('moveend', () => {
    roadLineLayer.value?.getSource()?.changed()
    roadPointLayer.value?.getSource()?.changed()
  })
}

/**
 *
 * @param map
 * @returns
 */
export const destroyMap = (map: OLMap) => map.setTarget(undefined)
