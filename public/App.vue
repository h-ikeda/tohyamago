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

@layer base {
  :root {
    @apply font-light;
  }
}

@tailwind components;
@tailwind utilities;

body {
  @apply h-dvh flex flex-col bg-gray-100 text-justify;
}
</style>

<style scoped>
main {
  @apply grow overflow-auto;
  @apply after:sticky after:bottom-0 after:bg-gradient-to-t after:from-gray-100 after:to-transparent after:w-full after:h-24 after:block;
}

footer {
  @apply text-center text-sm py-1 border-t border-lime-200 bg-lime-100 text-gray-700 font-light;
}
</style>
