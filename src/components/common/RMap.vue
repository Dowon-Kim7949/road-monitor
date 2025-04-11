<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'

const emit = defineEmits<{
  (e: 'select-marker', data: any): void
  (e: 'close-drawer'): void
}>()

const props = defineProps<{ leftDrawer: boolean; rightDrawer: boolean }>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<Map | null>(null)

const mapStyle = computed(() => {
  return {
    // left: props.leftDrawer ? '260px' : '0px',
    right: props.rightDrawer ? '25%' : '0px',
    transition: 'all 0.3s ease'
  }
})

// 수내역 중심 좌표
const center = fromLonLat([127.128, 37.378])

const createMarkers = () => {
  const features: Feature[] = []
  for (let i = 0; i < 5; i++) {
    const lon = 127.127 + Math.random() * 0.01
    const lat = 37.377 + Math.random() * 0.01
    const coord = fromLonLat([lon, lat])

    const feature = new Feature({
      geometry: new Point(coord),
      data: {
        lat,
        lon,
        roadName: `수내역 주변 도로 ${i + 1}`,
        image: 'https://rm-project.site/assets/test/demo_241219/CAMFront_camera2024-12-19T18_37_18_977+01_00.webp'
      }
    })

    feature.setStyle(
      new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          anchor: [0.5, 1],
          scale: 0.6
        })
      })
    )

    features.push(feature)
  }

  const vectorSource = new VectorSource({ features })
  const vectorLayer = new VectorLayer({ source: vectorSource })
  map.value?.addLayer(vectorLayer)

  // 마커 클릭 이벤트 처리
  map.value?.on('singleclick', (e) => {
    let clicked = false
    map.value?.forEachFeatureAtPixel(e.pixel, (feature) => {
      const data = feature.get('data')
      if (data) {
        emit('select-marker', data)
        clicked = true
      }
    })
    if (!clicked) {
      emit('close-drawer')
    }
  })
}

const handleResetCenter = (coords: number[]) => {
  map.value?.getView().animate({ center: coords, zoom: 15 })
}

onMounted(() => {
  if (!mapContainer.value) return

  map.value = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center,
      zoom: 15
    })
  })

  createMarkers()
  window.addEventListener('reset-map-center', (e: Event) => {
    const coords = (e as CustomEvent).detail
    handleResetCenter(coords)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('reset-map-center', () => { })
})
</script>

<template>
  <div ref="mapContainer" class="absolute top-0 left-0 h-full" :style="mapStyle"></div>
</template>

<style scoped></style>
