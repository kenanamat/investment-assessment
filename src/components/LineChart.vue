<template>
  <Line
    :chart-options="chartOptions"
    :chart-data="value"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :css-classes="cssClasses"
    :width="width"
    :height="height"
  />
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { computed } from '@vue/reactivity';
import { useStore } from 'vuex';
import { ref } from 'vue'

const store = useStore()
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

interface Props {
  chartId?: string,
  datasetIdKey?: string,
  width?: number,
  height?: number,
  cssClasses?: string,
  number?: number,
  styles?: string,
  value?: any
}
const props = withDefaults(defineProps<Props>(), {
  chartId: 'bar-chart',
  datasetIdKey: 'label', 
  width: 100,
  height: 100,
  cssClasses: '',
  number: 0,
  styles: '',
  value: ''
})


const chartOptions = {
  responsive: false,
  scales: {
    y: {
      max: 400,
      min: 0,
    }
  }
}

</script>
