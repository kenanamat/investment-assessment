<template>
  <input type="range" min="1" max="100" v-model="number" 
    @input ="datasets = {
      labels: [ 'January', 'February', 'March' ],
      datasets: [ { data: [10, Number(number), 12] } ]
    }"
  >
  {{number}}
  {{datasets}}
  <!-- <Bar :value="datasets"/> -->
  <Barc
    chartId="bar-chart"
    :chartData="{
    labels: [ 'January', 'February', 'March' ],
    datasets: [ { data: [10, Number(number), 12] } ]
  }"
    datasetIdKey='label'
    :width="100"
    :height="100"
    cssClasses=''
    styles=''
  />
</template>

<script lang="ts" setup>
  import { computed } from '@vue/reactivity';
  import { ref } from 'vue'
  import { useStore } from 'vuex';
  import Barc from './Bar.vue';
  import { Bar } from 'vue-chartjs'


  const store = useStore()
  const props = defineProps<{
    questionnaire: string,
    user: string | null
  }>();

  const number = computed({
    // getter
    get() {
      return store.getters['getNumber']('group_0')
    },
    // setter
    set(newNumber) {
      store.dispatch('updateNumber', newNumber)
    }
  })
  const datasets = ref({
    labels: [ 'January', 'February', 'March' ],
    datasets: [ { data: [10, Number(number.value), 12] } ]
  })
</script>

<style lang="scss">
</style>