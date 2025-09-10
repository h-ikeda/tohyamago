<template>
  <h1 class="w-fit mx-auto text-xl my-8 relative
             before:border-x-[1rem] before:border-x-transparent before:border-b-[1.73rem] before:border-b-green-500 before:relative before:-left-3.5 before:-top-7 before:scale-110
             after:border-x-[1rem] after:border-x-transparent after:border-b-[1.73rem] after:border-b-green-700 after:absolute after:-left-1 after:top-0 after:scale-[1.35]"
  >
    一般社団法人遠山郷応援会
  </h1>
  <section class="w-fit mx-auto my-6">
    <img
      class="aspect-video object-cover"
      :src="farmImage.toString()"
    >
  </section>
  <nav class="flex text-lg font-medium justify-center mb-4 gap-2 border-b border-gray-500 shadow-md">
    <RouterLink
      class="tracking-widest px-10 bg-white rounded-t-md border-x border-t border-gray-500"
      :class="{'border-b-2': hash !== '#events', 'text-gray-500': hash === '#events'}"
      to="#feed"
    >
      近況
    </RouterLink>
    <RouterLink
      class="tracking-widest px-10 border-black bg-white rounded-t-md border-x border-t"
      :class="{'border-b-2': hash === '#events', 'text-gray-500': hash !== '#events'}"
      to="#events"
    >
      予定
    </RouterLink>
  </nav>
  <section v-if="hash === '#events'">
    <p class="mx-5 bg-white border px-6 py-4 rounded-xl tracking-tighter">
      今後の活動予定は、<a class="underline" href="https://activo.jp/s/a/119414">ボランティア募集ページ</a>に掲載しています。「所属期間/頻度」欄をご確認下さい。
    </p>
    <p class="mx-auto w-fit font-medium text-lime-600 text-lg">
      <a
        class="border-3 bg-lime-100 px-4 py-2 my-4 block border-double shadow-md flex items-center gap-2
               after:border-l-10 after:border-y-6 after:border-y-transparent after:block after:h-0"
        href="https://activo.jp/s/a/119414">
        ボランティア募集中!
      </a>
    </p>
  </section>
  <facebookFeed v-else/>
</template>

<script setup lang="ts">
import FacebookFeed from '../components/FacebookFeed.vue'

const farmImage = new URL('../assets/farm.jpg', import.meta.url)

const { hash } = defineProps<{
  hash?: string
}>()
</script>
