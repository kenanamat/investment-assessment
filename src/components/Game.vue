<template>
  <div id="leaderboard" v-if="groupSubmitted">
    <div v-for="group in groupsInSession">
      {{group.game.rounds[currentRound].profit}}<br/>
    </div>
    <button v-if="userGroup.leader == user" @click="store.dispatch('readyUp', userGroup.id)">
      Ready
    </button>
  </div>
  <div v-else id="game">
    <input type="range" min="1" max="100" v-model="rdVal" 
      @input ="datasets = {
        labels: [ 'January', 'February', 'March' ],
        datasets: [ { data: [10, Number(rdVal), 12] } ]
      }"
    >
    {{rdVal}}
    <BarChart
      chartId="bar-chart"
      :chartData="{
        labels: [ 'January', 'February', 'March' ],
        datasets: [ { data: [10, Number(rdVal), 12] } ]
      }"
      datasetIdKey='label'
      :width="400"
      :height="400"
      cssClasses=''
      styles=''
    />
    <input type="range" min="1" max="100" v-model="factVal">
    {{factVal}}
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
        answers: {rd: rdAnswer, factories: factAnswer},
        profit: rdAnswer + factAnswer
      })"
    >
      verder
    </button>

  </div>
</template>

<script lang="ts" setup>
  import { GroupState } from '@/store/types';
  import { computed } from '@vue/reactivity';
  import { ref } from 'vue'
  import { useStore } from 'vuex';
  import BarChart from './BarChart.vue';
  import LineChart from './LineChart.vue';


  const store = useStore()
  const props = defineProps<{
    user: string | null
  }>();

  // store.dispatch('checkRound')

  const activeSession = store.getters['getActiveSession']()
  const currentRound = computed(() => store.getters['getCurrentRound']())
  const userGroup = computed(() => store.getters['getUserGroup'](props.user))
  const groupRound = computed(() => store.getters['getGroupGameRound'](userGroup.value.id, currentRound.value))
  const groupSubmitted = computed(() => groupRound.value.completed)
  const groupsInSessionIds = store.getters['getGroupsInSession'](activeSession.id)
  const groupsInSession = computed(() => {
    var groups: Array<GroupState> = []
    groupsInSessionIds.forEach((g:string) => groups.push(store.getters['getGroup'](g)))
    return groups
  })

  const rdVal = computed({
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
  const factVal = computed({
    // getter
    get() {
      return store.getters['getGroupValue'](userGroup.value.id, currentRound.value, 'factories')
    },
    // setter
    set(newNumber) {
      store.dispatch('updateNumber', {
        groupId: userGroup.value.id,
        value: Number(newNumber),
        type: 'factories'
      })
    }
  })

  const rdAnswer = computed(() => rdVal.value * 10)
  const factAnswer = computed(() => Math.round(factVal.value / 2))

  const datasets = ref({
    labels: [ 'January', 'February', 'March' ],
    datasets: [ { data: [10, Number(rdVal.value), 12] } ]
  })

  const randomData = computed(() => {
    var y = 0
    var limit = 6
    var dataLabels = []
    var dataPoints = []
    for (var i = 0; i < limit; i += 1) {
      y += (Math.random() * factVal.value);
      dataLabels.push(i - limit / 2);
      dataPoints.push(y)
    }
    return [dataPoints, dataLabels]
  });
</script>

<style lang="scss">
</style>