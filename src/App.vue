<template>
  <Header/>
  <div id="login">
    <Suspense>
      <router-view/>
    </Suspense>
  </div>
 
</template>

<script lang="ts" setup>
import Header from './components/Header.vue';
</script>