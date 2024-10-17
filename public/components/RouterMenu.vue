<template>
  <nav v-show="!hidden" @click="cancel" />
  <Transition :name="name" @after-enter="done">
    <button v-show="hidden" @click="menu">
      目次
    </button>
  </Transition>
  <Transition :name="name" @after-leave="done">
    <menu v-show="!hidden" @click="next">
      <li>
        <RouterLink to="/purpose" class="link">活動趣旨</RouterLink>
      </li>
      <li>
        <RouterLink to="/articles" class="link">定款</RouterLink>
      </li>
      <li>
        <RouterLink to="/public_notices" class="link">公告</RouterLink>
      </li>
      <li>
        <RouterLink to="/notation" class="link">特定商取引法に基づく表記</RouterLink>
      </li>
    </menu>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const hidden = ref(true)
const going = ref(0)
const name = computed(() => going.value ? 'next' : 'v')

const menu = () => { hidden.value = false }
const cancel = () => { hidden.value = true }
const next = () => {
  going.value = 2
  hidden.value = true
}
const done = () => { if (going.value) --going.value }
</script>

<style scoped>
menu, button {
  @apply fixed bottom-2 left-4;
}

menu {
  @apply bg-slate-600 flex flex-col rounded-md border border-slate-400 text-gray-100 shadow-lg;
}

menu > li:not(:last-child) {
  @apply border-b border-slate-500;
}

.link {
  @apply flex px-4 py-1.5;
}

menu.v-enter-from, menu.v-leave-to {
  @apply scale-y-0 translate-y-full;
}

menu.v-enter-active, menu.v-leave-active {
  @apply transition-transform origin-bottom;
}

menu.v-enter-to, menu.v-leave-from {
  @apply scale-y-100 translate-y-0;
}

menu.next-leave-from {
  @apply translate-y-0 scale-y-100;
}

menu.next-leave-active {
  @apply transition-transform origin-top;
}

menu.next-leave-to {
  @apply -translate-y-full scale-y-0;
}

button {
  @apply w-14 h-14 rounded-full border border-slate-300 shadow bg-slate-600 text-gray-200;
}

button::after {
  content: "▲";
  @apply absolute bottom-14 inset-x-0 text-sm text-slate-500 animate-bounce;
}

button.v-leave-from, button.v-enter-to {
  @apply scale-y-100 translate-y-0;
}

button.v-leave-active, button.v-enter-active {
  @apply transition-transform origin-top;
}

button.v-leave-to, button.v-enter-from {
  @apply scale-y-0 -translate-y-full;
}

button.next-enter-from {
  @apply scale-y-0 translate-y-full;
}

button.next-enter-active {
  @apply transition-transform origin-bottom;
}

button.next-enter-to {
  @apply scale-y-100 translate-y-0;
}

nav {
  @apply fixed inset-0;
}
</style>

