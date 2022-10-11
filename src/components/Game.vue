<template>
  <div v-if="groupSubmitted">
    <div v-if="groupGame.interview && groupRound.interviewAnswer == ''">
      <div id="question">
        <div class="input">
          <div class="title">
            <h2>Why did you choose your answer?</h2>
          </div>
          <textarea v-model="interviewAnswer" type="text" placeholder="Type your answer here..."/>
        </div>
      </div>
      <button class="next" @click="store.dispatch('submitInterview', {
          groupId: userGroup.id,
          answer: interviewAnswer
        });
        interviewAnswer = ''"
      >
        Submit answer
      </button>
    </div>
    <div v-else>
      <div id="leaderboard">
        <Leaderboard/>
      </div>
    </div>
  </div>
  <div v-else id="game">
    <Timer :time="groupGame.time" v-if="groupGame"/>

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
    <button v-if="userGroup.leader == currentUser" @click="store.dispatch('submitAnswer', {
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
  import Leaderboard from './Leaderboard.vue';
import Timer from './Timer.vue';


  const store = useStore()

  // store.dispatch('checkRound')
  const currentUser = localStorage.getItem('userid')
  const activeSession = store.getters['getActiveSession']()

  const currentRound = computed(() => store.getters['getCurrentRound']())

  const userGroup = computed(() => store.getters['getUserGroup'](currentUser))
  const groupGame = computed(() => store.getters['getGroupGame'](userGroup.value.id))
  const groupRound = computed(() => store.getters['getGroupGameRound'](userGroup.value.id, currentRound.value))
  const interviewAnswer = ref("")


  const groupSubmitted = computed(() => groupRound.value.completed)
  const groupsInSessionIds = store.getters['getGroupsInSession'](activeSession.id)
  const groupsInSession = computed(() => {
    var groups: Array<GroupState> = []
    groupsInSessionIds.forEach((g:string) => groups.push(store.getters['getGroup'](g)))
    return groups
  })
  const maxRounds = userGroup.value.game.rounds.length - 1

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