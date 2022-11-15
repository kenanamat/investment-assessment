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
    class="h-100 mx-auto d-flex align-items-center justify-content-center w-50 m-5 p-5 box"
    v-else-if="pathItem.type == 'pre-game'"
  >
    <div v-if="userGroup.treatment == 'esg'">
      <h2 class="fw-bold">{{ userGroup.treatment.toUpperCase() }} target</h2>
      <br /><br />
      <p>
        Dear board members,<br /><br />
        The supervisory board of The Giant Rubber Corporation is thrilled you have been
        selected as one of our potential board members. Next to running the company
        effectively and efficiently, the board wants you to pay specific attention to our
        environmental and social impact. <br /><br />
        We have therefore decided to set a board specific target for your board.
        <br /><br />
        Your board has a specific <strong>ESG target</strong>, next to making profits and
        paying sufficient attention to our environmental and social impact. Your specific
        target implies that you earn additional points for your social and environmental
        impact, compared to the impact of other rubber corporations. Every unit of
        environmental impact comes with a cost of an additional 0.2 points. Every unit of
        negative social impact comes with a cost of an additional 0.5 point. If the social
        impact is positive you earn additional points. Finally, you receive 2 points for
        every unit R&D for increased energy efficiency in production you invested in.
        <br /><br />
        All the best,<br /><br />
        Joe Bicycletire <br /><br />
        Chairman of the Supervisory Board of The Giant Rubber Corporation
      </p>
    </div>
    <div v-if="userGroup.treatment == 'profit'">
      <h2 class="fw-bold">{{ capitalize(userGroup.treatment) }} target</h2>
      <br /><br />
      <p>
        Dear board members, <br /><br />
        The supervisory board of The Giant Rubber Corporation is thrilled you have been
        selected as one of our potential board members. Next to running the company
        effectively and efficiently, the board wants you to pay specific attention to our
        profitability during your term of eight years. <br /><br />
        We have therefore decided to set a board specific target for your board.
        <br /><br />
        Your board has a specific <strong>profit target</strong>, next to making profits
        and paying sufficient attention to our environmental and social impact. This
        implies that you earn additional points for every dollar of after-tax profits,
        compared to the profits of other rubber corporations. For every dollar of
        additional profits, you earn 0.01 extra points. <br /><br />
        All the best,<br /><br />
        Joe Bicycletire<br /><br />
        Chairman of the Supervisory Board of The Giant Rubber Corporation
      </p>
    </div>
    <div v-if="userGroup.treatment == 'r&d'">
      <h2 class="fw-bold">{{ userGroup.treatment.toUpperCase() }} target</h2>
      <br /><br />
      <p>
        Dear board members, <br /><br />
        The supervisory board of The Giant Rubber Corporation is thrilled you have been
        selected as one of our potential board members. Next to running the company
        effectively and efficiently, the board wants you to pay specific attention to our
        ability to innovate and become more productive during your term of eight years.<br /><br />

        We have therefore decided to set a board specific target for your board.<br /><br />

        Your board has a <strong>R&D target</strong>, next to making profits and paying
        sufficient attention to our innovative potential. This implies that you earn
        additional points for investing in R&D, compared to the R&D investment of other
        rubber corporations. You earn an additional 1.5 points for every unit in the three
        types of R&D you invested in. <br /><br />
        All the best,<br /><br />
        Joe Bicycletire<br /><br />
        Chairman of the Supervisory Board of The Giant Rubber Corporation
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { capitalize } from "vue";
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
