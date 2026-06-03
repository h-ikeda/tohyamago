<template>
  <nav class="mx-auto mb-6 flex w-fit gap-2 font-serif text-lg font-medium">
    <a
      class="rounded-full px-8 py-1.5 tracking-widest transition-colors"
      :class="
        activeTab !== 'events'
          ? 'bg-primary text-base shadow-sm'
          : 'text-primary/60 hover:text-primary'
      "
      href="#feed"
      @click.prevent="select('feed')"
    >
      近況
    </a>
    <a
      class="rounded-full px-8 py-1.5 tracking-widest transition-colors"
      :class="
        activeTab === 'events'
          ? 'bg-primary text-base shadow-sm'
          : 'text-primary/60 hover:text-primary'
      "
      href="#events"
      @click.prevent="select('events')"
    >
      予定
    </a>
  </nav>
  <section v-show="activeTab === 'events'" class="mx-auto w-full max-w-2xl px-4 sm:px-6">
    <p class="rounded-2xl border border-primary/10 bg-surface px-6 py-4 leading-relaxed text-body shadow-sm">
      今後の活動予定は、<a
        class="text-accent underline underline-offset-2 hover:opacity-80"
        href="https://activo.jp/s/a/119414"
        target="_blank"
        rel="noopener noreferrer"
        >ボランティア募集ページ</a
      >に掲載しています。「所属期間/頻度」欄をご確認下さい。
    </p>
    <a
      class="mx-auto my-6 flex w-fit items-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-white shadow-sm transition-all hover:opacity-90 hover:shadow-lg
             after:block after:h-0 after:border-y-6 after:border-l-10 after:border-y-transparent after:border-l-white"
      href="https://activo.jp/s/a/119414"
      target="_blank"
      rel="noopener noreferrer"
    >
      ボランティア募集中!
    </a>
  </section>
  <div v-show="activeTab === 'feed'">
    <slot name="feed" />
  </div>
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
