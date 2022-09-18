<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <div id="login">
    <Suspense>
      <router-view/>
    </Suspense>
  </div>
 
</template>

<script lang="ts" setup>
</script>