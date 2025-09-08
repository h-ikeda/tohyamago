<template>
  <main :class="cls" class="grow overflow-auto" ref="main">
    <RouterView/>
  </main>
  <RouterMenu/>
  <footer
    class="text-sm py-1 border-t border-lime-300 bg-lime-100 text-gray-700 relative
           before:border-x-[0.58rem] before:border-b-[1rem] before:border-x-transparent before:border-b-green-500 before:absolute before:right-3.5 before:bottom-2
           after:border-x-[0.58rem] after:border-b-[1rem] after:border-x-transparent after:border-b-green-700 after:absolute after:right-2 after:bottom-1 after:scale-110 after:origin-bottom-right"
  >
    <RouterLink to="/" class="mx-auto w-fit block">
      一般社団法人遠山郷応援会
    </RouterLink>
  </footer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import RouterMenu from './components/RouterMenu.vue'
import { computed, Ref, ref, watch } from 'vue';

const route = useRoute()
const cls = computed(() => route.meta.fullscreen ? [] : [
  'after:sticky',
  'after:bottom-0',
  'after:bg-gradient-to-t',
  'after:from-gray-100',
  'after:to-transparent',
  'after:opacity-90',
  'after:w-full',
  'after:h-20',
  'after:block',
  'before:top-0',
  'before:bg-gradient-to-b',
  'before:from-lime-400',
  'before:to-transparent',
  'before:w-full',
  'before:h-8',
  'before:opacity-25',
  'before:block',
])
const main = ref(null) as Ref<HTMLElement | null>

watch(() => route.path, () => {
  if (route.meta.fullscreen) return
  main.value?.scrollTo({ top: 0 })
})
</script>

<style>
@import "tailwindcss";

:root {
  font-weight: var(--font-weight-light);
}

body {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-gray-100);
  text-align: justify;
}
</style>
