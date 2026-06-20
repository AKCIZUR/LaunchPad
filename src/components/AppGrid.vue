<script setup lang="ts">
import AppCard from "./AppCard.vue"
import type { AppEntry } from "@/types"

const props = withDefaults(defineProps<{ apps: AppEntry[]; iconSize?: number; cellMin?: number }>(), {
  iconSize: 80,
  cellMin: 104,
})

const emit = defineEmits<{
  (e: "open", app: AppEntry): void
  (e: "focus", app: AppEntry): void
}>()
</script>

<template>
  <TransitionGroup
    v-if="apps.length"
    tag="div"
    class="grid"
    :style="{
      '--cell-min': `${cellMin}px`,
      '--row-gap': `${Math.max(22, Math.round(iconSize * 0.28))}px`,
    }"
    name="card"
  >
    <AppCard
      v-for="app in apps"
      :key="app.id"
      :app="app"
      :icon-size="iconSize"
      @open="emit('open', $event)"
      @focus="emit('focus', $event)"
    />
  </TransitionGroup>

  <div v-else class="empty">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
      <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
    </svg>
    <p>Žádná aplikace</p>
    <span>Zkus jiný název nebo štítek.</span>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr));
  column-gap: 8px;
  row-gap: var(--row-gap);
  justify-items: center;
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    column-gap: 4px;
    row-gap: 22px;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 72px 0;
  text-align: center;
}
.empty-icon {
  color: var(--text-faint);
  margin-bottom: 4px;
}
.empty p {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-muted);
}
.empty span {
  font-size: 12.5px;
  color: var(--text-faint);
}
.card-enter-active {
  transition: opacity 0.28s var(--ease), transform 0.28s var(--ease);
}
.card-leave-active {
  transition: opacity 0.16s var(--ease-in), transform 0.16s var(--ease-in);
  position: absolute;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.card-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
.card-move {
  transition: transform 0.30s var(--ease);
}
</style>
