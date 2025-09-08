<template>
  <nav v-show="!hidden" @click="cancel" class="fixed inset-0" />
  <Transition :name="name" @after-enter="done">
    <button
      v-show="hidden"
      @click="menu"
      class="fixed left-4 z-10 bottom-2 w-14 h-14 rounded-full border border-slate-300 shadow bg-slate-600 text-gray-200 cursor-pointer
             after:content-['▲'] after:absolute after:bottom-14 after:inset-x-0 after:text-sm after:text-slate-500 after:animate-bounce
             [&.v-leave-from]:scale-y-100 [&.v-leave-from]:translate-y-0
             [&.v-enter-to]:scale-y-100 [&.v-enter-to]:translate-y-0
             [&.v-leave-active]:transition-transform [&.v-leave-active]:origin-top
             [&.v-enter-active]:transition-transform [&.v-enter-active]:origin-top
             [&.v-leave-to]:scale-y-0 [&.v-leave-to]:-translate-y-full
             [&.v-enter-from]:scale-y-0 [&.v-enter-from]:-translate-y-full
             [&.next-enter-from]:scale-y-0 [&.next-enter-from]:translate-y-full
             [&.next-enter-active]:transition-transform [&.next-enter-active]:origin-bottom
             [&.next-enter-to]:scale-y-100 [&.next-enter-to]:translate-y-0"
    >
      目次
    </button>
  </Transition>
  <Transition :name="name" @after-leave="done">
    <menu
      v-show="!hidden"
      @click="next"
      class="fixed left-4 z-10 bottom-4 bg-slate-600 flex flex-col rounded-md border border-slate-400 text-gray-100 shadow-lg
             [&.v-enter-from]:scale-y-0 [&.v-enter-from]:translate-y-full
             [&.v-leave-to]:scale-y-0 [&.v-leave-to]:translate-y-full
             [&.v-enter-active]:transition-transform [&.v-leave-active]:transition-transform
             [&.v-enter-active]:origin-bottom [&.v-leave-active]:origin-bottom
             [&.v-enter-to]:scale-y-100 [&.v-leave-from]:scale-y-100
             [&.v-enter-to]:translate-y-0 [&.v-leave-from]:translate-y-0
             [&.next-leave-from]:translate-y-0 [&.next-leave-from]:scale-y-100
             [&.next-leave-active]:transition-transform [&.next-leave-active]:origin-top
             [&.next-leave-to]:-translate-y-full [&.next-leave-to]:scale-y-0"
    >
      <li v-for="link in links" class="border-b border-slate-500 last:border-none">
        <a
          v-if="link.path.startsWith('https://')"
          :href="link.path"
          class="flex px-4 py-1.5 gap-2
                 before:border-l-4 before:border-transparent"
        >
          {{ link.title }}
        </a>
        <RouterLink
          v-else
          :to="link.path"
          class="flex px-4 py-1.5 gap-2
                 before:border-l-4 before:border-transparent"
          activeClass="before:border-l-4 before:border-y-4 before:border-l-white before:h-0 before:self-center"
        >
          {{ link.title }}
        </RouterLink>
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

const links = [{
  path: '/purpose',
  title: '活動趣旨',
}, {
  path: '/membership',
  title: '入会案内',
}, {
  path: '/articles',
  title: '定款',
}, {
  path: '/public_notices',
  title: '公告',
}, {
  path: 'https://shop.tohyamago.org',
  title: '成果品販売',
}, {
  path: '/notation',
  title: '特定商取引法に基づく表記',
}]
</script>
