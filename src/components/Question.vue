<template>
  <div id="question-wrapper">
    <div id="question">
      <div class="input" v-if="currentQuestion.type == 'input'">
        <h3>{{currentQuestion.question}}</h3>
        <input v-model="currentQuestion.answer" type="text" placeholder="Help"/>
      </div>
      <div class="multiple" v-else-if="currentQuestion.type == 'multiple'">
        <h3>{{currentQuestion.question}}</h3>
        <div class="radio" v-for="letter in Object.keys(currentQuestion.answers)" :key="letter">
          <input type="radio" :id="letter" :value="currentQuestion.answers[letter]" v-model="currentQuestion.answer"/>
          <label :for="letter">{{currentQuestion.answers[letter]}}</label>
        </div>
      </div>
    </div>

    <div id="next-buttons">
      <button v-if="currentQuestionIdx > 1" class="prev alt">
        Previous question
      </button>
      <button class="next" @click="store.dispatch('gotoNextQuestion', {
          userId: user,
          questionnaire: questionnaire,
          currentQuestionIdx: currentQuestionIdx,
          answer: currentQuestion.answer
        })"
      >
        Next question
      </button>
    </div>
  </div>
  
</template>

<script lang="ts" setup>
  import { useStore } from 'vuex';

  const store = useStore()
  const props = defineProps<{
    questionnaire: string,
    user: string | null
  }>();

  const currentQuestion = store.getters['getCurrentQuestion'](props.user, props.questionnaire)
  const currentQuestionIdx = store.getters['getCurrentQuestionIdx'](props.user, props.questionnaire)
  const questionnaireLen = Object.keys(store.getters['getUserQuestionnaire'](props.user, props.questionnaire)).length

</script>

<style lang="scss">
  @use '@/assets/sass/components/question';
</style>