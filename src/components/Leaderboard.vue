<template>
  <div id="leaderboard">
    <div id="top-5-wrapper">
      <div id="top-5" class="row mb-5">
        <div class="col-3">
          <div class="scores-list">
            <h4>Cumulative Profits</h4>
            <div v-for="group in rankedProfits.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{Math.round((group[1] as GroupState).game.rounds[currentRound].results.tot_profit_post_tax)}}
            </div>
          </div>
        </div>
        <div class="col-3">
          <div class="scores-list">
            <h4>Cumulative Environmental Impact</h4>
            <div v-for="group in rankedFE.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{Math.round((group[1] as GroupState).game.rounds[currentRound].results.tot_environmental_impact)}}
            </div>
          </div>
        </div>
        <div class="col-3">
          <div class="scores-list">
            <h4>Cumulative Social Impact</h4>
            <div v-for="group in rankedFL.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{Math.round((group[1] as GroupState).game.rounds[currentRound].results.tot_social_impact)}}
            </div>
          </div>
        </div>
        <div class="col-3">
          <div class="scores-list">
            <h4>Cumulative R&D</h4>
            <div v-for="group in rankedRD.slice(0, 5)" :key="group[0]">
              {{ group[0] }}:
              {{Math.round((group[1] as GroupState).game.rounds[currentRound].results.tot_rd)}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="group-graphs-wrapper">
      <div id="group-graphs">
        <nav>
          <div>
            <h6
              @click="selectedGroup = userGroup.id"
              :class="{ active: selectedGroup == userGroup.id }"
              :style="{ border: '2px solid ' + userGroup.color }"
            >
              {{ userGroup.id }}
            </h6>
          </div>
          <div v-for="group in otherGroups" :key="(group as GroupState).id">
            <h6
              @click="selectedGroup = (group as GroupState).id"
              :class="{active: selectedGroup == (group as GroupState).id}"
              :style="{ border: '2px solid ' + (group as GroupState).color }"
            >
              {{ (group as GroupState).id }}
            </h6>
          </div>
        </nav>
        <div id="graphs">
          <LineChart
            :chartData="{
              labels: Array.from(Array(currentRound + 1).keys()).map(
                (num) => 'Period ' + Number(num + 1)
              ),
              datasets: [
                {
                  label: 'Cumulative profits',
                  backgroundColor: groups[selectedGroup].color,
                  data: getDataProfit,
                },
              ],
            }"
          />
          <LineChart
            :chartData="{
              labels: Array.from(Array(currentRound + 1).keys()).map(
                (num) => 'Period ' + Number(num + 1)
              ),
              datasets: [
                {
                  label: 'Cumulative Enviromental Impact',
                  backgroundColor: groups[selectedGroup].color,
                  data: getDataFE,
                },
              ],
            }"
          />
          <LineChart
            :chartData="{
              labels: Array.from(Array(currentRound + 1).keys()).map(
                (num) => 'Period ' + Number(num + 1)
              ),
              datasets: [
                {
                  label: 'Cumulative Social Impact',
                  backgroundColor: groups[selectedGroup].color,
                  data: getDataFL,
                },
              ],
            }"
          />
          <LineChart
            :chartData="{
              labels: Array.from(Array(currentRound + 1).keys()).map(
                (num) => 'Period ' + Number(num + 1)
              ),
              datasets: [
                {
                  label: 'Cumulative R&D',
                  backgroundColor: groups[selectedGroup].color,
                  data: getDataRD,
                },
              ],
            }"
          />
        </div>
      </div>
    </div>
    <button
      v-if="
        userGroup.leader == currentUser && !display && !Object.values(userGroup.ready)[0]
      "
      @click="store.dispatch('readyUp', userGroup.id)"
    >
      Ready
    </button>
    <h4 v-if="Object.values(userGroup.ready)[0]">
      Please wait until the other groups are also ready, then the next round will start
    </h4>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { GroupState, ResultState, RoundState } from "@/store/types";

import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";

const store = useStore();

console.log(window.scrollTo(0, 0));

const props = withDefaults(defineProps<{ display?: boolean }>(), {
  display: false,
});

const currentUser = localStorage.getItem("userid");
const activeSession = store.getters["getActiveSession"]();
const currentRound = computed(() => store.getters["getCurrentRound"]());

const userGroup = computed(() => store.getters["getUserGroup"](currentUser));
const groups = computed(() => store.getters["getGroupsFromSession"](activeSession.id));
const otherGroups = computed(() =>
  Object.values(groups.value).filter(
    (group) => (group as GroupState).id !== userGroup.value.id
  )
);
const selectedGroup = ref(userGroup.value.id);

const getDataProfit = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_profit_post_tax
  );
});
const getDataFE = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_environmental_impact
  );
});
const getDataFL = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_social_impact
  );
});
const getDataRD = computed(() => {
  return Array.from(
    Object.values(groups.value[selectedGroup.value].game.rounds) as RoundState[],
    (round: RoundState) => round.results.tot_rd
  );
});

const rankedProfits = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[currentRound.value].results.tot_profit_post_tax -
      (a as GroupState).game.rounds[currentRound.value].results.tot_profit_post_tax
  );
});
const rankedFE = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[currentRound.value].results.tot_environmental_impact -
      (a as GroupState).game.rounds[currentRound.value].results.tot_environmental_impact
  );
});
const rankedFL = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[currentRound.value].results.tot_social_impact -
      (a as GroupState).game.rounds[currentRound.value].results.tot_social_impact
  );
});
const rankedRD = computed(() => {
  return Object.entries(groups.value).sort(
    ([, a], [, b]) =>
      (b as GroupState).game.rounds[currentRound.value].results.tot_rd -
      (a as GroupState).game.rounds[currentRound.value].results.tot_rd
  );
});

Chart.register(...registerables);
</script>

<style lang="scss">
@use '@/assets/sass/components/leaderboard';
</style>
