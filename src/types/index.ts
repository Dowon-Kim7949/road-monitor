export interface history {
  src: string
  date: string
  title?: string
  label?: string
  pciLabel?: string
  pciColor?: string
  score?: number
  potholes?: number
}

export interface testData {
  lat: number
  lon: number
  roadName: string
  image: string
  nodeLink: string
  timestamp: string
}
