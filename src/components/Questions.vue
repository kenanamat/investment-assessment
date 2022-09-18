<template>

</template>

<script lang="ts" setup>
  import { useStore } from 'vuex';

  const store = useStore()

  const props = defineProps<{
    questionnaire: string;
  }>();

</script>