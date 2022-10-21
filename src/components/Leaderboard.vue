<template>
  <LineChart
    chartId="bar-chart"
    :chartData="{
      labels: roundList,
      datasets: profitsGroupsDataset.slice(0, 10),
    }"
    datasetIdKey="label"
    :width="400"
    :height="400"
    cssClasses=""
    styles=""
  />
  <button
    v-if="userGroup.leader == currentUser && !display"
    @click="store.dispatch('readyUp', userGroup.id)"
  >
    Ready
  </button>
  <div id="score-table">
    <div class="row">
      <div class="col-1 border"></div>
      <div class="col border" v-for="round in roundList">
        {{ round }}
      </div>
    </div>
    <div class="row" v-for="group in groupsInSessionIds">
      <div class="col-1 border">
        {{ group }}
      </div>
      <div
        class="col border"
        v-for="profit in profitsGroups[group].slice(0, currentRound + 1)"
      >
        {{ profit }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import LineChart from "./LineChart.vue";

const store = useStore();

const props = withDefaults(defineProps<{ display?: boolean }>(), {
  display: false,
});

const currentUser = localStorage.getItem("userid");
const activeSession = store.getters["getActiveSession"]();
const currentRound = computed(() => store.getters["getCurrentRound"]());

const roundNumberList = Array.from(Array(currentRound.value + 1).keys());
const roundList = roundNumberList.map((roundNumber, index) => {
  return "Round " + String(Number(roundNumber) + 1);
});

const userGroup = computed(() => store.getters["getUserGroup"](currentUser));
const groupsInSessionIds = store.getters["getGroupsInSession"](activeSession.id);
const groups = computed(() => store.getters["getGroups"](activeSession.id));

const profitsGroupsDataset = computed(() =>
  groupsInSessionIds.reduce((profits: Array<Object>, groupId: string) => {
    profits.push({
      label: groupId,
      backgroundColor: groups.value[groupId].color,
      data: store.getters["getGroupProfits"](groupId),
    });
    return profits;
  }, [])
);

const profitsGroups = computed(() =>
  groupsInSessionIds.reduce((profits: { [id: string]: number }, groupId: string) => {
    profits[groupId] = store.getters["getGroupProfits"](groupId);
    return profits;
  }, {})
);
</script>
