<template>
  <div
    id="timer"
    :class="{ stressed: timeLeft < stressTime }"
    :style="{ right: shakeRight + 'px', top: shakeTop + 'px' }"
  >
    {{ getTime(timeLeft) }}
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "@vue/reactivity";
import { useStore } from "vuex";

const store = useStore();

const zeroPadded = (num: number) => {
  return num < 10 ? `0${num}` : num;
};
const getTime = (sec: number) => {
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${zeroPadded(minutes)}:${zeroPadded(seconds)}`;
};

interface Props {
  time?: number;
}
const props = withDefaults(defineProps<Props>(), {
  time: 30,
});

const endTime = computed(() => store.getters["getActiveSession"]().timerEnd);
if (endTime.value <= Date.now() || endTime.value == null) {
  store.dispatch("setTimerEnd", props.time);
}

const timeLeft = ref(props.time);
const stressTime = 30;
const shakeRight = ref(0);
const shakeTop = ref(0);

var shakeMoment = 0;

const intervalTimer = setInterval(() => {
  timeLeft.value = Math.round((endTime.value - Date.now()) / 1000);
  store.state.timeLeft = timeLeft.value;

  if (timeLeft.value < stressTime && shakeMoment >= Math.min(10, timeLeft.value / 3)) {
    shakeRight.value = Math.random() * (stressTime - timeLeft.value) * 0.2;
    shakeTop.value = Math.random() * (stressTime - timeLeft.value) * 0.1;
    shakeMoment = 0;
  }

  if (timeLeft.value < 0) {
    clearInterval(intervalTimer);
    timeLeft.value = 0;
    return;
  }

  shakeMoment++;
}, 10);
</script>

<style lang="scss">
@use '@/assets/sass/components/timer';
</style>
