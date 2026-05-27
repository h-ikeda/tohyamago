<template>
  <nav
    class="flex text-lg font-medium justify-center mb-4 gap-2 border-b border-gray-500 shadow-md"
  >
    <a
      class="tracking-widest px-10 bg-white rounded-t-md border-x border-t border-gray-500"
      :class="{
        'border-b-2': activeTab !== 'events',
        'text-gray-500': activeTab === 'events',
      }"
      href="#feed"
      @click.prevent="select('feed')"
    >
      近況
    </a>
    <a
      class="tracking-widest px-10 border-black bg-white rounded-t-md border-x border-t"
      :class="{
        'border-b-2': activeTab === 'events',
        'text-gray-500': activeTab !== 'events',
      }"
      href="#events"
      @click.prevent="select('events')"
    >
      予定
    </a>
  </nav>
  <section v-if="activeTab === 'events'">
    <p class="mx-5 bg-white border px-6 py-4 rounded-xl tracking-tighter">
      今後の活動予定は、<a class="underline" href="https://activo.jp/s/a/119414"
        >ボランティア募集ページ</a
      >に掲載しています。「所属期間/頻度」欄をご確認下さい。
    </p>
    <p class="mx-auto w-fit font-medium text-lime-600 text-lg">
      <a
        class="border-3 bg-lime-100 px-4 py-2 my-4 block border-double shadow-md flex items-center gap-2
               after:border-l-10 after:border-y-6 after:border-y-transparent after:block after:h-0"
        href="https://activo.jp/s/a/119414"
      >
        ボランティア募集中!
      </a>
    </p>
  </section>
  <slot v-else name="feed" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const activeTab = ref<'feed' | 'events'>('feed')

const syncFromHash = () => {
  activeTab.value = window.location.hash === '#events' ? 'events' : 'feed'
}

const select = (tab: 'feed' | 'events') => {
  activeTab.value = tab
  const newHash = `#${tab}`
  if (window.location.hash !== newHash) {
    history.replaceState(null, '', newHash)
  }
}

onMounted(() => {
  syncFromHash()
  window.addEventListener('hashchange', syncFromHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncFromHash)
})
</script>
