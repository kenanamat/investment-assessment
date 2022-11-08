<template>
  <div v-show="false" v-if="!currentSession">
    {{ router.push("/") }}
  </div>

  <div v-show="false">
    {{
      store.dispatch("addQuestionnaireToUser", {
        questionnaireId: pathItem.id,
        userId: currentUser,
      })
    }}
  </div>

  <div v-show="false" v-if="(!nextPathItem && isReady) || !pathItem">
    {{ router.push("/thankyou") }}
  </div>
  <div v-show="false" v-else-if="nextPathItem && !nextPathItem.canContinue && isReady">
    {{ router.push("/waiting") }}
  </div>

  <div v-else-if="pathItem.type == 'questionnaire'" id="questionnaire">
    <div v-if="!pathItem.completed && isReady && nextPathItem.canContinue">
      <h1>Please wait</h1>
      <h2>Not ready from your group:</h2>
      <div id="validIds">
        <ul>
          <li v-for="user in unreadyFromGroup">
            <p>{{ user }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <Question :questionnaire="pathItem.id" :user="currentUser" />
    </div>
  </div>
  <div v-else-if="pathItem.type == 'game'">
    <Game :key="currentSession.currentRound" />
  </div>
  <div v-else-if="pathItem.type == 'fakeGame'">
    <FakeGame />
  </div>
  <div
    class="w-100 h-100 d-flex align-items-center justify-content-center"
    v-else-if="pathItem.type == 'pre-game'"
  >
    <h2>Your treatment: {{ userGroup.treatment }}</h2>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { computed } from "@vue/reactivity";
import { useStore } from "vuex";
import Question from "../components/Question.vue";
import Game from "@/components/Game.vue";
import FakeGame from "@/components/FakeGame.vue";
const store = useStore();
await store.dispatch("bindDatabase");

store.dispatch("checkPath");

const currentUser = localStorage.getItem("userid");
var isReady: any = false;

const pathItem = computed(() => store.getters["getPathItem"]());
const nextPathItem = computed(() => store.getters["getNextPathItem"]());
const currentSession = computed(() => store.getters["getActiveSession"]());
// const lastPathItem = computed(() => store.getters['getActiveSession']().path.at(-1))

store.dispatch("addQuestionnaireToUser", {
  questionnaireId: pathItem.value.id,
  userId: currentUser,
});

const groupId = store.getters["getUser"](currentUser).group;
const unreadyFromGroup = computed(() => store.getters["getUnreadyUsers"](groupId));
const userGroup = computed(() => store.getters["getGroup"](groupId));

if (currentUser && store.getters["isActiveUser"](currentUser) && currentUser != "admin") {
  isReady = computed(() => userGroup.value.ready[currentUser]);
} else {
  router.push("/");
}
</script>
