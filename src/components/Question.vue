<template>
  <div id="question-wrapper">
    <div id="question">
      <div class="input" v-if="currentQuestion.type == 'input'">
        <div class="title">
          <small>{{currentQuestion.id}}</small>
          <h2>{{currentQuestion.question}}</h2>
        </div>
        <input v-model="answer" type="text" placeholder="Type your answer here..."/>
      </div>
      <div class="multiple" v-else-if="currentQuestion.type == 'multiple'">
        <div class="title">
          <small>{{currentQuestion.id}}</small>
          <h2>{{currentQuestion.question}}</h2>
        </div>
        <label class="radio" v-for="letter in Object.keys(currentQuestion.answers)" :key="letter">
          <input type="radio" :id="letter" :value="currentQuestion.answers[letter]" v-model="answer"/>
          <div class="letter">{{letter}}</div>
          <div class="answer">{{currentQuestion.answers[letter]}}</div>
        </label>
      </div>
    </div>
    <br/>
    <div id="next-buttons">
      <button v-if="currentQuestion.id > 1" class="prev alt" @click="store.dispatch('gotoPrevQuestion', {
          userId: user,
          questionnaire: questionnaire,
          currentQuestionId: currentQuestion.id,
          answer: answer
        });
        answer = currentQuestion.answer"
      >
        Previous question
      </button>
      <div v-else></div>
      <button class="next" @click="store.dispatch('gotoNextQuestion', {
          userId: user,
          questionnaire: questionnaire,
          currentQuestionId: currentQuestion.id,
          answer: answer
        }); 
        answer = ''"
      >
        Next question
      </button>
    </div>
  </div>
  
</template>

<script lang="ts" setup>
  import { ref, computed } from '@vue/reactivity';
  import { useStore } from 'vuex';

  const store = useStore()
  const props = defineProps<{
    questionnaire: string,
    user: string | null
  }>();

  const currentQuestion = computed(() => store.getters['getCurrentQuestion'](props.user, props.questionnaire))
  const answer = ref(currentQuestion.value.answer)

</script>

<style lang="scss">
  @use '@/assets/sass/components/question';
</style>