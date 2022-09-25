<template>
  <div id="base">
    <Header/>
    <div id="main">
      <Suspense>
        <router-view/>
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from './components/Header.vue';
</script>