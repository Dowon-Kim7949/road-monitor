<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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

const MAP_DURATION = 300
const ZOOM_THRESHOLD = 19
const ZOOM_DEFAULT = 17
const ZOOM_MINLEVEL = 15
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
const iriHeatmapLayer = ref<HeatmapLayer | null>(null)
const iriCenter = ref(fromLonLat([-0.22365497581524368, 51.49220408472129]))

const BORDER_COLOR = 'rgba(0, 0, 0, 0.8)'
const BORDER_EXTRA_WIDTH = 4

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
  { threshold: 5, color: 'rgba(0, 255, 0, 0.7)' },
  { threshold: 10, color: 'rgba(255, 255, 0, 0.7)' },
  { threshold: 20, color: 'rgba(255, 165, 0, 0.7)' },
  { threshold: Infinity, color: 'rgba(255, 0, 0, 0.7)' }
];
const iriHeatmapGradient = [
  '#0000ff',
  '#00ffff',
  '#00ff00',
  '#ffff00',
  '#ffaa00',
  '#ff4500',
  '#ff0000'
];
const defaultIriColor = 'rgba(128, 128, 128, 0.7)';

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

const iriLayerStyleFunction = (feature: FeatureLike) => {
  const properties = feature.getProperties();
  const iriValue = properties['iri'];
  const featureId = feature.getId();
  let color = defaultIriColor;
  let strokeWidth = 6;
  let zIndex = 0;

  if (typeof iriValue === 'number') {
    for (const mapping of iriColorMapping) {
      if (iriValue <= mapping.threshold) {
        color = mapping.color;
        break;
      }
    }
  }

  if (selectedWayId.value != null && selectedWayId.value === featureId?.toString()) {
    strokeWidth = 10;
    zIndex = 1;
  }

  return new Style({
    stroke: new Stroke({
      color: color,
      width: strokeWidth
    }),
    zIndex: zIndex
  });
};

const layerStyleFunction = (feature: FeatureLike): Style | Style[] | undefined => {
  const currentZoom = map.value?.getView().getZoom()
  if (!currentZoom) return undefined
  const geometry: any = feature.getGeometry()
  if (!geometry) return undefined
  const featureType = geometry.getType()
  const properties = feature.getProperties()
  const featureWayId =
    featureType === 'LineString' ? feature.getId()?.toString() : properties['parent_way_id']?.toString()

  const isSelectedLine =
    selectedWayId.value != null && selectedWayId.value === featureWayId
  let isSelectedPoint = false
  if (featureType === 'Point' && selectedPointCoords.value) {
    const currentCoords = (geometry as Point).getCoordinates()
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
    default:
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

const mapStyle = computed(() => {
  return {
    right: props.rightDrawer ? '25%' : '0px',
    left: props.type === 'cover' ? '25%' : '0px',
    transition: 'all 0.3s ease',
  }
})
const center = fromLonLat([-0.22365497581524368, 51.49220408472129])

const loadLayers = async () => {
  if (!map.value) return
  isLoading.value = true
  const wayIdToColorMap = new Map<string, string>()

  if (roadLineLayer.value) map.value.removeLayer(roadLineLayer.value as any)
  if (roadPointLayer.value) map.value.removeLayer(roadPointLayer.value as any)
  roadLineLayer.value = null
  roadPointLayer.value = null

  try {
    const lineResponse = await fetch('/filtered.geojson')
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
          const parentId = propsFs['parent_way_id']?.toString()
          if (parentId && wayIdToColorMap.has(parentId)) {
            feature.set('assigned_rpci_color', wayIdToColorMap.get(parentId))
          } else {
            feature.set('assigned_rpci_color', rpciColors['default'])
          }
        })
      } else {
        pointFeatures.forEach((feature: any) => {
          feature.set('assigned_rpci_color', rpciColors['default'])
        })
      }

      const pointSource = new VectorSource<any>({ features: pointFeatures })
      roadPointLayer.value = new VectorLayer({
        source: pointSource,
        style: layerStyleFunction,
        renderBuffer: 20,
      })
      map.value.addLayer(roadPointLayer.value as any)
    } else {
      roadPointLayer.value = null
    }
  } catch (error) {
    alert(`Error loading layers: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const makeIriLayer = async (mapInstance: OLMap | null, geojsonPath = '/iri_data.json') => {
  if (!mapInstance || !(mapInstance instanceof OLMap)) {
    alert('유효한 지도 객체가 전달되지 않았습니다.');
    return;
  }

  isLoading.value = true;

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

    const heatmapPoints: Feature<Point>[] = [];
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    const features = new GeoJSON().readFeatures(iriGeoJsonData);

    features.forEach((feature: FeatureLike) => {
      const geometry = feature.getGeometry();
      const properties = feature.getProperties();
      let iriValue = properties['iri'];

      if (geometry && geometry.getType() === 'LineString' && typeof iriValue === 'number') {
        const clampedIri = Math.max(0, Math.min(10, iriValue));
        const coordinates = (geometry as LineString).getCoordinates();
        coordinates.forEach((coord: Coordinate) => {
          const mapCoord = fromLonLat(coord, mapInstance.getView().getProjection());
          minLon = Math.min(minLon, coord[0]);
          maxLon = Math.max(maxLon, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
          const pointFeature = new Feature({
            geometry: new Point(mapCoord),
            weight: clampedIri
          });
          heatmapPoints.push(pointFeature);
        });
      }
    });

    if (minLon !== Infinity) {
      const centerLon = (minLon);
      const centerLat = (minLat);
      iriCenter.value = fromLonLat([centerLon, centerLat]);
    } else {
      iriCenter.value = fromLonLat([-0.22365497581524368, 51.49220408472129]);
    }


    if (heatmapPoints.length === 0) {
      isLoading.value = false;
      return;
    }

    const iriHeatmapSource = new VectorSource({
      features: heatmapPoints
    });

    iriHeatmapLayer.value = new HeatmapLayer({
      source: iriHeatmapSource,
      blur: 10,
      radius: 5,
      weight: (feature: FeatureLike) => {
        const weight = feature.get('weight');
        return (typeof weight === 'number') ? weight / 10 : 0;
      },
      gradient: iriHeatmapGradient,
      zIndex: 5
    });

    isLoading.value = false;

    mapInstance.addLayer(iriHeatmapLayer.value as any);

    mapInstance.getView().animate({ center: iriCenter.value, zoom: 15, duration: MAP_DURATION });


  } catch (error) {
    alert(`IRI 히트맵 레이어 로딩 오류: ${error}`)
    if (iriHeatmapLayer.value) {
      iriHeatmapLayer.value = null;
    }
  } finally {
    isLoading.value = false
  }
};

const handleResetCenter = () => {
  map.value?.getView().animate({ center: center, zoom: ZOOM_DEFAULT, duration: MAP_DURATION })
}

const vworldTileLayer = new TileLayer({
  source: new OSM()
})

const customInteractions = defaultInteractions().extend([
  new MouseWheelZoom({
    constrainResolution: true,
  }),
])

const iriTooltipOverlay = ref<any>(null);
const iriTooltipContent = ref<HTMLElement | null>(null);

const showIriLayerHandler = async () => {
  if (map.value) {
    await makeIriLayer(map.value as any);
  }
};

const hideIriLayerHandler = () => {
  if (map.value && iriHeatmapLayer.value) {
    map.value.removeLayer(iriHeatmapLayer.value as any);
    iriHeatmapLayer.value = null;
  }
  if (iriTooltipOverlay.value) {
    iriTooltipOverlay.value.setPosition(undefined);
  }
}

onMounted(async () => {
  if (!mapContainer.value) return
  const tooltipElement = document.getElementById('iri-tooltip');
  iriTooltipContent.value = document.getElementById('iri-tooltip-content');

  if (!tooltipElement || !iriTooltipContent.value) {
    return;
  }
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
    overlays: [iriTooltipOverlay.value]
  });

  if (props.type) {
    await loadLayers();
  }

  map.value?.on('singleclick', (e: MapBrowserEvent<UIEvent>) => {
    if (props.type === 'cover' || props.type === 'report') {
      if (iriTooltipOverlay.value) {
        iriTooltipOverlay.value.setPosition(undefined);
      }
      if (selectedWayId.value) {
        selectedWayId.value = null;
        if (iriHeatmapLayer.value?.getSource()) iriHeatmapLayer.value.getSource()?.changed();
        if (roadLineLayer.value?.getSource()) roadLineLayer.value.getSource()?.changed();
        if (roadPointLayer.value?.getSource()) roadPointLayer.value.getSource()?.changed();
      }
      emit('close-drawer');
      return;
    }

    let clickedFeatureInstance: any = null;
    let clickedLayer: VectorLayer<any> | null = null;

    const clickableLayers: VectorLayer<any>[] = [];
    if (roadLineLayer.value) clickableLayers.push(roadLineLayer.value as any);
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      clickableLayers.push(roadPointLayer.value as any);
    }

    map.value?.forEachFeatureAtPixel(
      e.pixel,
      (feature, layer) => {
        clickedFeatureInstance = feature;
        clickedLayer = layer as VectorLayer<any>;
        return true;
      },
      {
        layerFilter: (layer) => clickableLayers.includes(layer as VectorLayer<any>),
      }
    )

    let clickedWayId: string | null = null;
    let clickedPointCoords: number[] | null = null;
    let isPointClick = false;
    let isLineClick = false;
    let lineFirstCoord: number[] | null = null;

    if (clickedFeatureInstance) {
      const geometry = clickedFeatureInstance.getGeometry();
      const type = geometry?.getType();
      const properties = clickedFeatureInstance.getProperties();

      if (type === 'LineString') {
        clickedWayId = clickedFeatureInstance.getId()?.toString() ?? null;
        isLineClick = true;
        lineFirstCoord = (geometry as LineString).getFirstCoordinate();
      } else if (type === 'Point') {
        clickedWayId = properties['parent_way_id']?.toString() ?? null;
        clickedPointCoords = (geometry as Point).getCoordinates();
        isPointClick = true;
      }
    }

    let selectionChanged = false;
    if (selectedWayId.value !== clickedWayId || !compareCoordinates(selectedPointCoords.value, clickedPointCoords)) {
      selectedWayId.value = clickedWayId;
      selectedPointCoords.value = clickedPointCoords;
      selectionChanged = true;
    }

    if (selectionChanged) {
      if (roadLineLayer.value?.getSource()) roadLineLayer.value.getSource()?.changed();
      if (roadPointLayer.value?.getSource()) roadPointLayer.value.getSource()?.changed();
    }

    if (clickedFeatureInstance) {
      const properties = clickedFeatureInstance.getProperties();
      if (properties.geometry) {
        delete properties.geometry;
      }

      if (isPointClick && (props.type === 'road' || props.type === 'rpci')) {
        emit('select-feature', properties);
        if (map.value && clickedPointCoords) {
          map.value.getView().animate({ center: clickedPointCoords, duration: MAP_DURATION });
        }
      } else if (isLineClick && (props.type === 'road' || props.type === 'rpci')) {
        if (map.value && lineFirstCoord) {
          map.value.getView().animate({ zoom: ZOOM_THRESHOLD, center: lineFirstCoord, duration: MAP_DURATION });
        }
      }
    } else {
      if (selectedWayId.value !== null || selectedPointCoords.value !== null) {
        selectedWayId.value = null;
        selectedPointCoords.value = null;
        if (roadLineLayer.value?.getSource()) roadLineLayer.value.getSource()?.changed();
        if (roadPointLayer.value?.getSource()) roadPointLayer.value.getSource()?.changed();
        selectionChanged = true;
      }
      if (selectionChanged || props.type === 'road' || props.type === 'rpci') {
        emit('close-drawer');
      }
    }
  });

  map.value?.on('pointermove', (e: MapBrowserEvent<UIEvent>) => {
    if (e.dragging) return;
    const pixel = map.value?.getEventPixel(e.originalEvent);
    if (!pixel || !map.value) return;

    const hoverableLayers: VectorLayer<any>[] = [];

    if (roadLineLayer.value) hoverableLayers.push(roadLineLayer.value as any);
    if ((props.type === 'road' || props.type === 'rpci') && roadPointLayer.value) {
      hoverableLayers.push(roadPointLayer.value as any);
    }

    const hit = map.value.forEachFeatureAtPixel(pixel, (f, l) => true, {
      layerFilter: (l) => hoverableLayers.includes(l as VectorLayer<any>),
    });

    const targetElement = map.value.getTargetElement() as HTMLElement | undefined;
    if (targetElement) {
      if (props.type === 'cover' || props.type === 'report') {
        targetElement.style.cursor = '';
      } else {
        targetElement.style.cursor = hit ? 'pointer' : '';
      }
    }
  });

  map.value?.getView().on('change:resolution', () => {
    if (roadLineLayer.value?.getSource()) roadLineLayer.value.getSource()?.changed()
    if (roadPointLayer.value?.getSource()) roadPointLayer.value.getSource()?.changed()
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

  window.addEventListener('show-iri-layer', showIriLayerHandler);
  window.addEventListener('hide-iri-layer', hideIriLayerHandler);
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.setTarget(undefined)
  }
  window.removeEventListener('reset-map-center', handleResetCenter);
  window.removeEventListener('show-iri-layer', showIriLayerHandler);
  window.removeEventListener('hide-iri-layer', hideIriLayerHandler);
  const zoomInHandler = () => {
    const currentZoom = map.value?.getView().getZoom();
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom + 1, duration: MAP_DURATION });
  };
  const zoomOutHandler = () => {
    const currentZoom = map.value?.getView().getZoom();
    if (currentZoom) map.value?.getView().animate({ zoom: currentZoom - 1, duration: MAP_DURATION });
  };
  window.removeEventListener('zoom-in-map', zoomInHandler);
  window.removeEventListener('zoom-out-map', zoomOutHandler);
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
