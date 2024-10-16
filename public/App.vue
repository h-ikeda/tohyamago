<template>
  <main>
    <RouterView/>
  </main>
  <RouterMenu/>
  <footer>一般社団法人遠山郷応援会</footer>
</template>

<script setup lang="ts">
import RouterMenu from './components/RouterMenu.vue'
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply h-dvh flex flex-col;
}
</style>

<style scoped>
main {
  @apply grow;
}

footer {
  @apply text-center text-sm py-1 border-t border-lime-200 bg-lime-100 text-gray-700 font-light;
}
</style>
