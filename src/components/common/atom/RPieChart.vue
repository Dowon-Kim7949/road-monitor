<template>
  <div class="pie-chart-container">
    <svg :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`" class="pie-chart-svg">
      <g :transform="`rotate(-90 ${center} ${center})`">
        <circle v-for="(segment, index) in segments" :key="index" :cx="center" :cy="center" :r="radius"
          fill="transparent" :stroke="segment.color" :stroke-width="strokeWidth" :stroke-dasharray="segment.dashArray"
          :stroke-dashoffset="segment.dashOffset" class="pie-chart-segment" />
      </g>

      <text :x="center" :y="center - 10" text-anchor="middle" dominant-baseline="middle" class="chart-label text-sm">
        rPCI Score
      </text>
      <text :x="center" :y="center + 15" text-anchor="middle" dominant-baseline="middle" class="chart-score">
        {{ score }} </text>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- Props ---
const props = defineProps({
  pieData: {
    type: Array,
    required: true,
    // Ensure data has percentage and color properties
    validator: (value) =>
      value.every(
        (item) =>
          typeof item.percentage === 'number' && typeof item.color === 'string'
      ),
  },
  // You can make the score dynamic
  score: {
    type: [Number, String],
    default: 67 // Default score from the image
  },
  // Configuration props
  viewBoxSize: {
    type: Number,
    default: 100
  },
  strokeWidth: {
    type: Number,
    default: 12 // Adjust thickness as needed
  }
});

// --- Constants ---
const center = computed(() => props.viewBoxSize / 2);
// Adjust radius based on stroke width to prevent clipping
const radius = computed(() => center.value - props.strokeWidth / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

// --- Computed properties for SVG ---
const segments = computed(() => {
  let cumulativePercentage = 0;
  const validData = props.pieData.filter(item => item.percentage > 0); // Ignore 0% segments

  return validData.map((item) => {
    const percentage = item.percentage;
    // Calculate the length of the arc segment
    const arcLength = (percentage / 100) * circumference.value;
    // Calculate the offset for this segment
    const dashOffset = -(cumulativePercentage / 100) * circumference.value;

    // Update cumulative percentage for the next segment
    cumulativePercentage += percentage;

    return {
      color: item.color,
      // dashArray defines the length of the colored segment and the gap
      dashArray: `${arcLength} ${circumference.value - arcLength}`,
      dashOffset: dashOffset,
    };
  });
});

</script>

<style scoped>
.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  /* Example width, adjust as needed */
}

.pie-chart-svg {
  width: 100%;
  height: auto;
  /* Maintain aspect ratio */
}

.pie-chart-segment {
  transition: stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease;
  /* Add stroke-linecap: round; for rounded ends if desired */
  stroke-linecap: butt;
  /* or round */
}

.chart-label {
  font-size: 12px;
  font-weight: bold;
  /* Adjust as needed */
  fill: #555;
  /* Adjust color */
}

.chart-score {
  font-size: 32px;
  /* Adjust as needed */
  font-weight: bold;
  fill: #000;
  /* Adjust color */
}

/* Optional Legend Styles */
.pie-chart-legend {
  list-style: none;
  padding: 0;
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.pie-chart-legend li {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 2px;
  /* Make it square or circle */
}
</style>
