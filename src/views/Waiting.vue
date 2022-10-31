<template>
  <div class="box col-5 p-4">
    <h1>Till tomorrow!</h1>
    <hr />
    <h2>Your username: &nbsp; {{ user.id }}</h2>
    <h2>Secret code: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{ user.code }}</h2>
  </div>

  <div v-if="nextPathItem.canContinue && pathItem.canContinue">
    {{ router.push("/questionnaire") }}
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";

const store = useStore();
await store.dispatch("bindDatabase");

store.dispatch("checkPath");

const currentUser = localStorage.getItem("userid");
if (currentUser == null) router.push("/");

const pathItem = computed(() => store.getters["getPathItem"]());
const nextPathItem = computed(() => store.getters["getNextPathItem"]());
const user = computed(() => store.getters["getUser"](currentUser));

if (currentUser && user.value.code == undefined) {
  store.dispatch("setCode", currentUser);
}

if (
  !(currentUser && store.getters["isActiveUser"](currentUser) && currentUser != "admin")
) {
  router.push("/");
}
</script>
