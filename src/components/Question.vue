<template>
  <div id="question-wrapper">
    <form id="question" @submit.prevent="
      store.dispatch('gotoNextQuestion', {
        userId: user,
        questionnaire: questionnaire,
        currentQuestionId: currentQuestion.id,
        answer: answer,
        followup: followupAnswer ?? ''
      });
      resetQuestion()"
    >
      <QuestionType v-model:answer="answer" :question="currentQuestion" :key="currentQuestion.id"/>
      <div class="followup" v-if="currentQuestion.followup && answer == 'Yes'">
        <QuestionType v-model:answer="followupAnswer" :question="currentQuestion.followup" :key="currentQuestion.id"/>
      </div>
    </form>
    <br/>
    <div id="next-buttons">
      <button v-if="currentQuestion.id > 1" class="prev alt" @click="store.dispatch('gotoPrevQuestion', {
          userId: user,
          questionnaire: questionnaire,
          currentQuestionId: currentQuestion.id,
          answer: answer
        });
        resetQuestion()"
      >
        Previous question
      </button>
      <div v-else></div>
      <button type="submit" form="question" class="next">
        Next question
      </button>
    </div>
  </div>
  
</template>

<script lang="ts" setup>
  import { ref, computed } from '@vue/reactivity';
  import { useStore } from 'vuex';
  import QuestionType from './QuestionType.vue';

  const store = useStore()
  const props = defineProps<{
    questionnaire: string,
    user: string | null
  }>();

  const currentQuestion = computed(() => store.getters['getCurrentQuestion'](props.user, props.questionnaire))
  const answer = ref(currentQuestion.value.answer)
  const followupAnswer = ref(currentQuestion.value.followup?.answer)

  const resetQuestion = () => {
    answer.value = currentQuestion.value.answer
    followupAnswer.value = currentQuestion.value.followup?.answer
  }
</script>

<style lang="scss">
  @use '@/assets/sass/components/question';
</style>