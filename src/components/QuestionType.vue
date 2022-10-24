<template>
  <div class="input" v-if="question.type == 'input'">
    <input
      v-model="answer"
      type="text"
      placeholder="Type your answer here..."
      @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
      :required="req"
    />
  </div>
  <div class="number" v-else-if="question.type == 'number'">
    <input
      v-model.number="answer"
      type="number"
      placeholder="..."
      @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
      :required="req"
    />
    <div class="chevrons">
      <i class="fa-solid fa-chevron-up" @click="(answer as number)++"></i>
      <i class="fa-solid fa-chevron-down" @click="(answer as number)--"></i>
    </div>
  </div>
  <div class="boolean" v-else-if="question.type == 'boolean'">
    <label
      class="radio"
      :class="{ checked: answer == question.answers[letter] }"
      v-for="letter in Object.keys(question.answers)"
      :key="letter"
    >
      <input
        type="radio"
        name="input-multiple"
        :id="letter"
        :value="question.answers[letter]"
        v-model="answer"
        @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
        :required="req"
      />
      <div class="letter d-flex align-items-center justify-content-center">
        {{ alphabet[Number(letter) - 1] }}
      </div>
      <div class="answer">{{ question.answers[letter] }}</div>
    </label>
  </div>
  <div class="scale-10" v-else-if="question.type == 'scale-10'">
    <input
      type="range"
      min="0"
      :max="Number(question.answers.length) - 1"
      v-model.number="answer"
      @input="$emit('update:answer', answer)"
      :required="req"
    />
    <label>
      <div
        v-for="a in question.answers"
        :key="a"
        :class="{ selected: a == answer }"
        @click="
          answer = a;
          $emit('update:answer', answer);
        "
      >
        {{ a }}
      </div>
    </label>
  </div>
  <div class="multiple" v-else-if="question.type == 'multiple'">
    <label
      class="radio"
      :class="{ checked: answer == question.answers[letter] }"
      v-for="letter in Object.keys(question.answers)"
      :key="letter"
    >
      <input
        type="radio"
        name="input-multiple"
        :id="letter"
        :value="question.answers[letter]"
        v-model="answer"
        @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
        :required="req"
      />
      <div class="letter d-flex align-items-center justify-content-center">
        {{ alphabet[Number(letter) - 1] }}
      </div>
      <div class="answer">{{ question.answers[letter] }}</div>
    </label>
  </div>
  <div class="range" v-else-if="question.type == 'range'">
    <div class="slider flex-fill">
      <input
        type="range"
        :min="0"
        :max="question.max"
        step="0.5"
        v-model.number="answer"
        @input="$emit('update:answer', answer)"
      />
    </div>
    <div class="number">
      <input
        type="number"
        :min="0"
        :max="question.max"
        :step="0.5"
        v-model.number="answer"
        @input="$emit('update:answer', answer)"
      />
      <div class="chevrons">
        <i
          class="fa-solid fa-chevron-up"
          @click="(answer as number)++;
          $emit('update:answer', answer)"
        ></i>
        <i
          class="fa-solid fa-chevron-down"
          @click="(answer as number)--;
          $emit('update:answer', answer)"
        ></i>
      </div>
    </div>
  </div>
  <div class="scale" v-else-if="question.type == 'scale'">
    <label
      class="radio"
      :class="{
        checked: answer == question.answers[letter],
        negative: key - (Number(question.answers.length) - 1) / 2 < 0,
        positive: key - (Number(question.answers.length) - 1) / 2 > 0,
      }"
      v-for="(letter, key) in Object.keys(question.answers)"
      :key="letter"
      :style="{
        transform: `scale(1.${Math.abs(
          key - (Number(question.answers.length) - 1) / 2
        )})`,
      }"
    >
      <input
        type="radio"
        name="input-multiple"
        :id="letter"
        :value="question.answers[letter]"
        v-model="answer"
        @input="$emit('update:answer', ($event.target as HTMLInputElement).value)"
        :required="req"
      />
      <div class="answer"><i class="fa-solid fa-check"></i></div>
      <div
        class="letter d-flex align-items-center justify-content-center"
        :style="{
          transform: `scale(${
            1 - Math.abs(key - (Number(question.answers.length) - 1) / 2) / 10
          })`,
        }"
      >
        {{ question.answers[letter] }}
      </div>
    </label>
  </div>
  <div
    class="scale-wrapper"
    v-else-if="question.type == 'list-scale'"
    v-for="q in question.questions"
    :key="q"
  >
    <h2>{{ q }}</h2>
    <div class="scale">
      <label
        class="radio"
        :class="{
          checked: (answer as {[key:number]: string} )[question.questions.map((qs: string) => qs).indexOf(q)] == question.answers[letter],
          negative: key - (Number(question.answers.length) - 1) / 2 < 0,
          positive: key - (Number(question.answers.length) - 1) / 2 > 0,
        }"
        v-for="(letter, key) in Object.keys(question.answers)"
        :key="letter"
        :style="{
          transform: `scale(1.${Math.abs(
            key - (Number(question.answers.length) - 1) / 2
          )})`,
        }"
      >
        <input
          type="radio"
          name="input-multiple"
          :id="letter"
          :value="question.answers[letter]"
          v-model="(answer as string[])[question.questions.map((qs: string) => qs).indexOf(q)]"
          @input="$emit('update:answer', answer)"
          :required="req"
        />
        <div class="answer"><i class="fa-solid fa-check"></i></div>
        <div
          class="letter d-flex align-items-center justify-content-center"
          :style="{
            transform: `scale(${
              1 - Math.abs(key - (Number(question.answers.length) - 1) / 2) / 10
            })`,
          }"
        >
          {{ question.answers[letter] }}
        </div>
      </label>
    </div>
    <hr />
  </div>
  <div class="text" v-else-if="question.type == 'text'">
    <h4 class="my-4 mt-5">{{ question.question }}</h4>
    <textarea
      v-model="answer"
      @input="$emit('update:answer', answer)"
      type="text"
      maxlength="1250"
      placeholder="Type your answer here..."
      :required="req"
    />
  </div>
  <div class="ranking" v-else-if="question.type == 'ranking'">
    <div class="best">
      <label>1.</label>
      <input
        v-model="first"
        type="text"
        @drop="
          first = $event.dataTransfer ? $event.dataTransfer.getData('selection') : '';
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        :required="req"
        readonly
      />
      <br />
      <label>2.</label>
      <input
        v-model="second"
        type="text"
        @drop="
          second = $event.dataTransfer ? $event.dataTransfer.getData('selection') : '';
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        :required="req"
        readonly
      />
      <br />
      <label>3.</label>
      <input
        v-model="third"
        type="text"
        @drop="
          third = $event.dataTransfer ? $event.dataTransfer.getData('selection') : '';
          $emit('update:answer', first + ', ' + second + ', ' + third);
        "
        @dragover.prevent
        @dragenter.prevent
        :required="req"
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
interface Props {
  answer?: string | number | string[];
  question: QuestionState;
  req?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  answer: "",
  req: true,
});
const emits = defineEmits<{
  "update:answer": string | number | string[];
}>();

const answer = ref(props.answer);
if (props.question.type == "scale-10" && props.answer == "") {
  answer.value = Math.round((Number(props.question.answers.length) - 1) / 2);
}
if (props.question.type == "range" && props.answer == "") {
  answer.value = Math.round(props.question.max / 2);
}
if (props.question.type == "list-scale" && props.answer == "") {
  answer.value = Array(props.question.questions.length);
}

const shuffledAnswers = computed(() =>
  props.question.type == "ranking"
    ? store.getters["getShuffled"](props.question.answers)
    : []
);
const startDrag = (e: DragEvent, selection: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("selection", selection);
  }
};
const first = ref("");
const second = ref("");
const third = ref("");
const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
</script>

<style lang="scss">
@use '@/assets/sass/components/question';
</style>
