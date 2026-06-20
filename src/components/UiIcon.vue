<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  name: string
  size?: number
}>(), {
  size: 16,
})

const src = computed(() => `https://cdn.jsdelivr.net/npm/lucide-static/icons/${props.name}.svg`)
</script>

<template>
  <span
    class="ui-icon"
    aria-hidden="true"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
    }"
  />
</template>

<style scoped>
.ui-icon {
  display: inline-block;
  flex-shrink: 0;
  background-color: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  user-select: none;
  pointer-events: none;
}
</style>
