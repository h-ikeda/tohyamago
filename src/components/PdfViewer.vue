<template>
  <div ref="container" class="h-full" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  src: string
  filename: string
  licenseKey?: string
}>()

const container = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!container.value) return
  const { default: PdfjsExpressViewer } = await import('@pdftron/pdfjs-express-viewer')
  PdfjsExpressViewer(
    {
      licenseKey: props.licenseKey,
      initialDoc: props.src,
      filename: props.filename,
    },
    container.value,
  )
})
</script>
