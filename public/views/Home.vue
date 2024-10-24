<template>
  <h1>一般社団法人遠山郷応援会</h1>
  <div>
    <img :src="src">
  </div>
  <section>
    <time datetime="2024-10-01">令和6年10月1日</time>設立
  </section>
</template>

<script setup lang="ts">
import src from '../assets/mounts.jpg'
</script>

<style scoped>
h1 {
  @apply w-fit mx-auto text-lg my-8;
}

div {
  @apply border-8 m-8 border-gray-400 shadow-lg;
}

section {
  @apply w-fit mx-auto text-sm;
}
</style>
