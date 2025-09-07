<template>
  <h1>一般社団法人遠山郷応援会</h1>
  <section class="w-fit mx-auto my-6">
    <img
      class="aspect-video object-cover"
      :src="farmImage.toString()"
    >
  </section>
  <nav class="flex text-lg font-medium justify-center mb-2 gap-2">
    <RouterLink
      class="tracking-widest border-black px-10 bg-white rounded-t-md"
      :class="{'border-b-2': hash !== '#events', 'text-gray-600': hash === '#events'}"
      to="#feed"
    >
      近況
    </RouterLink>
    <RouterLink
      class="tracking-widest px-10 border-black bg-white rounded-t-md pointer-events-none"
      :class="{'border-b-2': hash === '#events', 'text-gray-600': hash !== '#events'}"
      to="#events"
    >
      予定
    </RouterLink>
  </nav>
  <FacebookFeed v-if="hash === '#events'"/>
  <facebookFeed v-else/>
</template>

<script setup lang="ts">
import FacebookFeed from '../components/FacebookFeed.vue'

const farmImage = new URL('../assets/farm.jpg', import.meta.url)

const { hash } = defineProps<{
  hash?: string
}>()
</script>

<style scoped>
h1 {
  @apply w-fit mx-auto text-xl my-8 relative;
  @apply before:border-x-[1rem] before:border-x-transparent before:border-b-[1.73rem] before:border-b-green-500 before:relative before:-left-3.5 before:-top-7 before:scale-110;
  @apply after:border-x-[1rem] after:border-x-transparent after:border-b-[1.73rem] after:border-b-green-700 after:absolute after:-left-1 after:top-0 after:scale-[1.35];
}
</style>
