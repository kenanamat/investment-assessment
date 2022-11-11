<template>
  <div class="row">
    <div class="box col-4 p-4">
      <h1>Discussion</h1>
      <hr />
      <p></p>
    </div>
    <div class="col-8" v-if="activeSession.showPoints">
      <div class="ms-5 ps-5">
        <div v-for="group in sortedGroups()" :key="group.id">
          {{ group.id }} | {{ Math.round(group.game.points) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GroupState } from "@/store/types";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const store = useStore();
await store.dispatch("bindDatabase");

const currentUser = localStorage.getItem("userid");
const activeSession = computed(() => store.getters["getActiveSession"]());

const groups = computed(() =>
  store.getters["getGroupsFromSession"](activeSession.value.id)
);

const sortedGroups = () => {
  return Object.fromEntries(
    Object.entries(groups.value).sort(
      ([, a], [, b]) => (b as GroupState).game.points - (a as GroupState).game.points
    )
  ) as { [k: string]: GroupState };
};
const userGroup = computed(() => store.getters["getUserGroup"](currentUser));

if (userGroup.value.game.points == 0) {
  store.dispatch("setPoints", userGroup.value.id);
}
</script>
