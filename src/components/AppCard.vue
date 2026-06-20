<script setup lang="ts">
import { hexToRgb, resolveAppAccent } from "@/lib/color"
import AppIcon from "./AppIcon.vue"
import type { AppEntry } from "@/types"

const props = withDefaults(defineProps<{ app: AppEntry; iconSize?: number }>(), {
  iconSize: 80,
})
const emit = defineEmits<{
  (e: "open", app: AppEntry): void
  (e: "focus", app: AppEntry): void
}>()
</script>

<template>
  <button
    class="card"
    :style="{ '--c-rgb': hexToRgb(resolveAppAccent(props.app)) }"
    :aria-label="props.app.name"
    @click="emit('open', props.app)"
    @mouseenter="emit('focus', props.app)"
    @focus="emit('focus', props.app)"
  >
    <div class="icon-wrap">
      <AppIcon :app="props.app" :size="iconSize" />
    </div>

    <span class="name">{{ props.app.name }}</span>
  </button>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 10px 12px 8px;
  background: transparent;
  border: none;
  border-radius: 0;
  text-align: center;
  transform: translateZ(0);
  transition: transform 0.28s var(--ease);
}

.card:hover,
.card:focus-visible {
  outline: none;
  transform: scale(1.08) translateY(-3px);
}

.card:active {
  transform: scale(0.94);
  transition-duration: 0.12s;
}

.icon-wrap {
  position: relative;
  flex-shrink: 0;
  transition: filter 0.28s var(--ease), transform 0.28s var(--ease);
}
.card:hover .icon-wrap,
.card:focus-visible .icon-wrap {
  filter: drop-shadow(0 8px 20px rgba(var(--c-rgb), 0.58));
  transform: translateY(-2px);
}

.name {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.2;
  max-width: 96px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
  transition: opacity 0.22s var(--ease), color 0.22s var(--ease), text-shadow 0.22s var(--ease);
}

:root[data-theme="light"] .name {
  text-shadow: none;
}
</style>
