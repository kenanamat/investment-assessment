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
      :max="question.max"
      :min="question.min"
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
        :min="question.min ?? 0"
        :max="question.max"
        step="1"
        v-model.number="answer"
        @input="$emit('update:answer', answer)"
      />
    </div>
    <div class="number">
      <input
        type="number"
        :min="question.min ?? 0"
        :max="question.max"
        step="1"
        placeholder="..."
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
    v-for="(q, idx) in question.questions"
    :key="q"
  >
    <h2>{{ q }}</h2>
    <div class="scale">
      <label
        class="radio"
        :class="{
          checked: (answer as string[])[idx] == question.answers[letter],
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
          v-model="(answer as string[])[idx]"
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
      v-model="(answer as string)"
      @input="$emit('update:answer', answer)"
      type="text"
      maxlength="1250"
      placeholder="Type your answer here..."
      :required="req"
    />
  </div>
  <div class="ranking" v-else-if="question.type == 'ranking'">
    <div
      class="selections ms-3"
      @drop="(answer as string[]).splice(currIdx, 1)"
      @dragover.prevent
      @dragenter.prevent
    >
      <p>Drag options to 'Your ranking'</p>
      <div
        v-for="selection in shuffledAnswers.filter((a: string) => !(answer as string[]).includes(a))"
        @dragstart="startDrag($event, selection)"
        @mouseenter="animate = true"
        @mouseleave="animate = false"
        draggable="true"
      >
        {{ selection }}
      </div>
    </div>
    <i class="fa-solid fa-arrow-right" :class="{ animate: animate }"></i>
    <div class="best p-4 shadow me-3">
      <h3>Your ranking</h3>
      <div
        class="rank-box"
        @drop="
          showIndicator = false;
          checkDrop($event.dataTransfer ? $event.dataTransfer.getData('selection') : '');
          $emit('update:answer', answer);
        "
        @dragover.prevent="
          checkIndicator(
            $event.dataTransfer ? $event.dataTransfer.getData('selection') : ''
          )
        "
        @mouseout="showIndicator = false"
        @dragexit="showIndicator = false"
        @dragenter.prevent
      >
        <div
          class="d-flex align-items-center mt-2"
          v-for="(a, idx) in answer"
          :key="(a as string)"
        >
          <label>{{ idx + 1 }}.</label>
          <span
            class="w-100 border"
            @dragstart="startDrag($event, (answer as string[])[idx]);currIdx = idx"
            @dragover.prevent="showIndicator = false"
            @drop="(answer as string[])[currIdx] = (answer as string[])[idx];
            (answer as string[])[idx] = $event.dataTransfer ? $event.dataTransfer.getData('selection') : '';"
            draggable="true"
          >
            {{ (answer as string[])[idx]}}
          </span>
        </div>
        <div :class="{ show: showIndicator }" class="indicator mt-2"></div>
        <br />
        <!-- <input
          v-model="(answer as string[])[2]"
          type="text"
          @drop="
          (answer as string[])[2] = $event.dataTransfer ? $event.dataTransfer.getData('selection') : '';
            $emit('update:answer', answer);
          "
          @dragover.prevent
          @dragenter.prevent
          :required="req"
          readonly
        /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { QuestionState } from "@/store/types";
import { computed, ref } from "@vue/reactivity";
import type { Ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

window.scrollTo(0, 0);

interface Props {
  answer?: string | number | (string | null)[];
  question: QuestionState;
  req?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  answer: "",
  req: true,
});
const emits = defineEmits<{
  "update:answer": string | number | (string | null)[];
}>();

const answer = ref(props.answer);
// if (props.question.type == "scale-10" && props.answer == "") {
//   answer.value = Math.round((Number(props.question.answers.length) - 1) / 2);
// }
// if (props.question.type == "range" && props.answer == "") {
//   answer.value = 0;
//   emits["update:answer"] = answer.value;
// }
if (props.question.type == "scale-10" && props.answer == "") {
  answer.value = 0;
}
if (props.question.type == "list-scale" && props.answer == "") {
  answer.value = new Array(props.question.questions.length).fill(null);
}
if (props.question.type == "ranking" && props.answer == "") {
  answer.value = [];
}

const checkDrop = (selection: string) => {
  if ((answer.value as (string | null)[]).includes(selection)) return;
  if ((answer.value as (string | null)[]).length < 3) {
    (answer.value as (string | null)[]).push(selection);
  } else {
    (answer.value as (string | null)[])[
      (answer.value as (string | null)[]).length - 1
    ] = selection;
  }
};
const currIdx = ref(0);
const showIndicator = ref(false);
const checkIndicator = (selection: string) => {
  if (
    (answer.value as (string | null)[]).length < 3 &&
    !(answer.value as (string | null)[]).includes(selection)
  )
    showIndicator.value = true;
};

const animate = ref(false);

const shuffledAnswers =
  props.question.type == "ranking"
    ? store.getters["getShuffled"](props.question.answers)
    : [];
const startDrag = (e: DragEvent, selection: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("selection", selection);
  }
};

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
