<template>
  <h1>一般社団法人遠山郷応援会</h1>
  <section>
    <img :src="farmImage">
    <caption>
      秘境の遊休農地を保全活用するボランティアによる耕作活動
    </caption>
  </section>
  <section class="events">
    <time datetime="2024-10-01">
      令和6年10月1日
    </time>
    <p>
      設立
    </p>
  </section>
</template>

<script setup lang="ts">
import farmImage from '../assets/farm.jpg'
</script>

<style scoped>
h1 {
  @apply w-fit mx-auto text-xl my-8 relative;
  @apply before:border-x-[1rem] before:border-x-transparent before:border-b-[1.73rem] before:border-b-green-500 before:relative before:-left-3.5 before:-top-7 before:scale-110;
  @apply after:border-x-[1rem] after:border-x-transparent after:border-b-[1.73rem] after:border-b-green-700 after:absolute after:-left-1 after:top-0 after:scale-[1.35];
}

section {
  @apply w-fit mx-auto my-4;
}

.events {
  @apply grid gap-x-4;
}

.events > p {
  @apply col-start-2;
}

img {
  @apply aspect-video object-cover;
}

caption {
  @apply block before:content-["▲"] text-justify -indent-4 pl-4 mx-4;
}
</style>
