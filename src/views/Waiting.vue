<template>
  <div class="row" v-if="user.group == 'onHold'">
    <div class="box col-5 p-4">
      <h1>Till tomorrow!</h1>
      <hr />
      <h2>Your username: &nbsp; {{ user.id }}</h2>
    </div>

    <form
      class="ps-5 col-5 d-flex align-items-center"
      v-if="session.code"
      id="code"
      @submit.prevent="store.dispatch('addUserToGroup', user.id)"
    >
      <input v-model="code" type="text" placeholder="Type the given code..." />
      <button v-if="code === String(session.code)" type="submit" form="code" class="next">
        Submit code
      </button>
    </form>
  </div>
  <div class="row" v-else>
    <div class="box col-5 p-4">
      <h1>Welcome</h1>
      <hr />
      <h4>Your username: {{ user.id }}</h4>
      <h2>Your group: {{ user.group }}</h2>
    </div>
    <div class="col-6 ps-5 ms-5">
      <img class="w-100" src="@/assets/img/GIANT_RUBBER_CORPORATION.png" />
    </div>
  </div>

  <div v-if="nextPathItem.canContinue && pathItem.canContinue">
    {{ router.push("/questionnaire") }}
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { computed, ref } from "@vue/reactivity";
import { useStore } from "vuex";

const store = useStore();
await store.dispatch("bindDatabase");

store.dispatch("checkPath");

const currentUser = localStorage.getItem("userid");
if (currentUser == null) router.push("/");

const pathItem = computed(() => store.getters["getPathItem"]());
const nextPathItem = computed(() => store.getters["getNextPathItem"]());
const user = computed(() => store.getters["getUser"](currentUser));
const session = computed(() => store.getters["getActiveSession"]());
const code = ref("");
// if (currentUser && user.value.code == undefined) {
//   store.dispatch("setCode", currentUser);
// }

if (
  !(currentUser && store.getters["isActiveUser"](currentUser) && currentUser != "admin")
) {
  router.push("/");
}
</script>
