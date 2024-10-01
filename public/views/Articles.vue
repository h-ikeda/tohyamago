<template>
  <div ref="container"/>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PdfjsExpressViewer from '@pdftron/pdfjs-express-viewer'
import articles from 'url:../assets/articles.pdf'

const container = ref(null)

watch(container, (value) => {
  if (!value) return
  PdfjsExpressViewer({
    licenseKey: process.env.PDFJS_EXPRESS_VIEWER,
    initialDoc: articles,
    filename: '一般社団法人遠山郷応援会定款',
  }, value)
})
</script>

<style module>
div {
  @apply h-full;
}
</style>