<template>
 {{getTime(secondsLeft)}}
</template>


<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useStore } from 'vuex';

const store = useStore()

const zeroPadded = (num: number) => {
  return num < 10 ? `0${num}` : num
}
const getTime = (sec: number) => {
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  return `${zeroPadded(minutes)}:${zeroPadded(seconds)}`
}

const secondsLeft = computed(() => store.getters['getActiveSession']().timeLeft)
store.dispatch('startCountdown', 90)

</script>