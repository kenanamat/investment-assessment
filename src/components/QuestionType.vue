<template>
  <div class="title">
    <small>{{ question.id }}</small>
    <h2>{{ question.question }}</h2>
    <p>{{ question.comment }}</p>
  </div>
  <div class="input" v-if="question.type == 'input'">
    <input
      v-model="answer"
      type="text"
      placeholder="Type your answer here..."
      @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
      required
    />
  </div>
  <div class="multiple" v-else-if="question.type == 'multiple'">
    <label class="radio" v-for="letter in Object.keys(question.answers)" :key="letter">
      <input
        type="radio"
        name="input-multiple"
        :id="letter"
        :value="question.answers[letter]"
        v-model="answer"
        @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
        required
      />
      <div class="letter">{{ letter }}</div>
      <div class="answer">{{ question.answers[letter] }}</div>
    </label>
  </div>
  <div class="range" v-else-if="question.type == 'range'">
    <input
      type="range"
      min="0"
      :max="question.max"
      v-model="answer"
      @input="$emit('update:answer', Number(($event.target as HTMLInputElement).value))"
      required
    />
    {{ answer }}
  </div>
  <div class="ranking" v-else-if="question.type == 'ranking'">
    <div class="best">
      <label>1.</label>
      <input
        v-model="first"
        type="text"
        @drop="
          first = $event.dataTransfer.getData('selection');
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        required
        readonly
      />
      <br />
      <label>2.</label>
      <input
        v-model="second"
        type="text"
        @drop="
          second = $event.dataTransfer.getData('selection');
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        required
        readonly
      />
      <br />
      <label>3.</label>
      <input
        v-model="third"
        type="text"
        @drop="
          third = $event.dataTransfer.getData('selection');
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        required
        readonly
      />
    </div>
    {{ answer }}
    <div class="selections">
      <div
        class="border"
        v-for="selection in shuffledAnswers"
        @dragstart="startDrag($event, selection)"
        draggable="true"
      >
        {{ selection }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { QuestionState } from "@/store/types";
import { computed, ref } from "@vue/reactivity";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps<{
  answer: string | number;
  question: QuestionState;
}>();
const emits = defineEmits<{
  "update:answer": string | number;
}>();

const answer = ref(props.answer);

const shuffledAnswers = computed(() =>
  props.question.type == "ranking"
    ? store.getters["getShuffled"](props.question.answers)
    : []
);
const startDrag = (evt, selection: string | number) => {
  evt.dataTransfer.dropEffect = "move";
  evt.dataTransfer.effectAllowed = "move";
  evt.dataTransfer.setData("selection", selection);
};
const first = ref("");
const second = ref("");
const third = ref("");
</script>

<style lang="scss">
@use '@/assets/sass/components/question';
</style>
