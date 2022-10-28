<template>
  <div id="leaderboard">
    <div id="top-5-wrapper">
      <div id="top-5" class="row">
        <div class="col-4">
          <div class="scores-list">
            <h4>Profits</h4>
            <div v-for="group in rankedProfits.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{(group[1] as GroupState).game.rounds[currentRound].results.tot_profit_post_tax}}
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="scores-list">
            <h4>Footprint Environment</h4>
            <div v-for="group in rankedFE.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{(group[1] as GroupState).game.rounds[currentRound].results.tot_footprint_environment}}
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="scores-list">
            <h4>Footprint Labour</h4>
            <div v-for="group in rankedFL.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{(group[1] as GroupState).game.rounds[currentRound].results.tot_footprint_labour}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="group-graphs-wrapper">
      <div id="group-graphs">
        <nav>
          <button>
            <h6 @click="selectedGroup = userGroup.id">{{ userGroup.id }}</h6>
          </button>
          <button v-for="group in otherGroups" :key="(group as GroupState).id">
            <h6 @click="selectedGroup = (group as GroupState).id">
              {{ (group as GroupState).id }}
            </h6>
          </button>
        </nav>
        <div id="graphs">
          <LineChart
            :chartData="{
              labels: ['Round' + currentRound],
              datasets: [
                {
                  data: getDataProfit,
                },
              ],
            }"
          />
          <LineChart
            :chartData="{
              labels: ['Round' + currentRound],
              datasets: [
                {
                  data: getDataFE,
                },
              ],
            }"
          />
          <LineChart
            :chartData="{
              labels: ['Round' + currentRound],
              datasets: [
                {
                  data: getDataFL,
                },
              ],
            }"
          />
        </div>
      </div>
    </div>
    <button
      v-if="userGroup.leader == currentUser && !display"
      @click="store.dispatch('readyUp', userGroup.id)"
    >
      Ready
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "@vue/reactivity"
import { useStore } from "vuex"
import { GroupState, ResultState, RoundState } from "@/store/types"

import { LineChart } from "vue-chart-3"
import { Chart, registerables } from "chart.js"

const store = useStore()

const props = withDefaults(defineProps<{ display?: boolean }>(), {
  display: false,
})

const currentUser = localStorage.getItem("userid")
const activeSession = store.getters["getActiveSession"]()
const currentRound = computed(() => store.getters["getCurrentRound"]())

const userGroup = computed(() => store.getters["getUserGroup"](currentUser))
const groups = computed(() => store.getters["getGroupsFromSession"](activeSession.id))
const otherGroups = computed(() =>
  Object.values(groups.value).filter(
    (group) => (group as GroupState).id !== userGroup.value.id
  )
)
const selectedGroup = ref(userGroup.value.id)

const getDataProfit = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_profit_post_tax
  )
})
const getDataFE = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_footprint_environment
  )
})
const getDataFL = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_footprint_labour
  )
})

const rankedProfits = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[0].results.tot_profit_post_tax -
      (a as GroupState).game.rounds[0].results.tot_profit_post_tax
  )
})
const rankedFE = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[0].results.tot_footprint_environment -
      (a as GroupState).game.rounds[0].results.tot_footprint_environment
  )
})
const rankedFL = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[0].results.tot_footprint_labour -
      (a as GroupState).game.rounds[0].results.tot_footprint_labour
  )
})
</script>

<style lang="scss">
@use '@/assets/sass/components/leaderboard';
</style>
