import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import HeatmapLayer from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import { fromLonLat } from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import { Feature, MapBrowserEvent, Overlay } from 'ol'
import { defaults as defaultInteractions, MouseWheelZoom } from 'ol/interaction'
import type LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import type { FeatureLike } from 'ol/Feature'
import type { Coordinate } from 'ol/coordinate'
import OSM from 'ol/source/OSM'

export const MAP_DURATION = 300
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
