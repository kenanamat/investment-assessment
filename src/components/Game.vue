<template>
  <div v-if="groupReady"> JA HOOOR KOMAANNNN</div>
  <input type="range" min="1" max="100" v-model="number" 
    @input ="datasets = {
      labels: [ 'January', 'February', 'March' ],
      datasets: [ { data: [10, Number(number), 12] } ]
    }"
  >
  {{number}}
  <BarChart
    chartId="bar-chart"
    :chartData="{
      labels: [ 'January', 'February', 'March' ],
      datasets: [ { data: [10, Number(number), 12] } ]
    }"
    datasetIdKey='label'
    :width="400"
    :height="400"
    cssClasses=''
    styles=''
  />
  <LineChart
    chartId="bar-chart"
    :chartData="{
      labels: randomData[1],
      datasets: [ { data: randomData[0] } ]
    }"
    datasetIdKey='label'
    :width="400"
    :height="400"
    cssClasses=''
    styles=''
  />
  <button v-if="userGroup.leader == user" @click="store.dispatch('submitAnswer', {
      groupId: userGroup.id, 
      answers: {rd: 0, factories: 0}
    })"
  >
    verder
  </button>
</template>

<script lang="ts" setup>
  import { computed } from '@vue/reactivity';
  import { ref } from 'vue'
  import { useStore } from 'vuex';
  import BarChart from './BarChart.vue';
  import LineChart from './LineChart.vue';


  const store = useStore()
  const props = defineProps<{
    user: string | null
  }>();

  store.dispatch('checkRound')

  const currentRound = computed(() => store.getters['getCurrentRound']())
  const userGroup = computed(() => store.getters['getUserGroup'](props.user))
  const groupReady = computed(() => store.getters['getUnreadyUsers'](userGroup.value.id) == "")

  const number = computed({
    // getter
    get() {
      return store.getters['getGroupValue'](userGroup.value.id, currentRound.value, 'rd')
    },
    // setter
    set(newNumber) {
      store.dispatch('updateNumber', {
        groupId: userGroup.value.id,
        value: Number(newNumber),
        type: 'rd'
      })
    }
  })
  const datasets = ref({
    labels: [ 'January', 'February', 'March' ],
    datasets: [ { data: [10, Number(number.value), 12] } ]
  })

  const randomData = computed(() => {
    var y = 0
    var limit = 6
    var dataLabels = []
    var dataPoints = []
    for (var i = 0; i < limit; i += 1) {
      y += (Math.random() * number.value);
      dataLabels.push(i - limit / 2);
      dataPoints.push(y)
    }
    return [dataPoints, dataLabels]
  });
</script>

<style lang="scss">
</style>