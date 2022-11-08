<template>
  <div id="question-wrapper">
    <div
      id="progress-bar"
      :style="{
        width: (currentQuestion.id / (currentQuestionnaire.length - 1)) * 100 + '%',
      }"
    ></div>
    <div class="header text-center">
      <small
        >Question {{ currentQuestion.id }}/{{ currentQuestionnaire.length - 1 }}
      </small>
      <h2 class="mt-2">{{ currentQuestion.question }}</h2>
      <p>{{ currentQuestion.comment }}</p>
    </div>
    <hr />
    <form
      id="question"
      :class="'question-' + currentQuestion.type"
      @submit.prevent="submitAnswer"
    >
      <QuestionType
        v-model:answer="answer"
        :question="currentQuestion"
        :key="currentQuestion.id"
      />
      <div
        v-if="currentQuestion.followup"
        class="followup"
        :class="{
          valid: currentQuestion.followup && (answer == 'Yes' || Number.isFinite(answer)),
        }"
      >
        <div class="title">
          <h4>{{ currentQuestion.followup.question }}</h4>
          <p>{{ currentQuestion.followup.comment }}</p>
        </div>

        <QuestionType
          v-model:answer="followupAnswer"
          :question="currentQuestion.followup"
          :key="currentQuestion.id"
          :req="currentQuestion.followup && (answer == 'Yes' || Number.isFinite(answer))"
        />
      </div>
    </form>
    <br />
    <div id="next-buttons" class="d-flex justify-content-between align-items-center">
      <button
        v-if="currentQuestion.id > 1"
        class="prev"
        @click="
          store.dispatch('gotoPrevQuestion', {
            userId: user,
            questionnaire: questionnaire,
            currentQuestionId: currentQuestion.id,
            answer: answer,
          });
          resetQuestion();
        "
      >
        Previous question
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <div v-else></div>
      <button type="submit" form="question" class="next">
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isNumericLiteral } from "@babel/types";
import { ref, computed } from "@vue/reactivity";
import { isArray, isString } from "@vue/shared";
import type { Ref } from "vue";
import { useStore } from "vuex";
import QuestionType from "./QuestionType.vue";

const store = useStore();
const props = defineProps<{
  questionnaire: string;
  user: string | null;
}>();

const currentQuestion = computed(() =>
  store.getters["getCurrentQuestion"](props.user, props.questionnaire)
);
const currentQuestionnaire = computed(() =>
  store.getters["getQuestionnaire"](props.questionnaire)
);
const answer: Ref<string | number | (string | null)[]> = ref(
  currentQuestion.value.answer
);
if (currentQuestion.value.type == "range") answer.value = 0;
const followupAnswer = ref(currentQuestion.value.followup?.answer);

const submitAnswer = () => {
  if (answer.value == "" && isString(answer.value))
    return alert("Please fill in an answer");
  if (
    isArray(answer.value) &&
    (answer.value.includes(null) || (answer.value as string[]).length < 3)
  )
    return alert("Please fill in all empty fields");
  store.dispatch("gotoNextQuestion", {
    userId: props.user,
    questionnaire: props.questionnaire,
    currentQuestionId: currentQuestion.value.id,
    answer: answer.value,
    followup: followupAnswer.value ?? "",
  });
  resetQuestion();
};

const resetQuestion = () => {
  answer.value = currentQuestion.value.answer;
  followupAnswer.value = currentQuestion.value.followup?.answer;
};
</script>

<style lang="scss">
@use '@/assets/sass/components/question';
</style>
