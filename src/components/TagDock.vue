<script setup lang="ts">
import { computed, type CSSProperties } from "vue"
import UiIcon from "./UiIcon.vue"
import { tagTheme } from "@/lib/color"

const props = defineProps<{
  tags: string[]
  selected: string[]
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: "toggle", tag: string): void
  (e: "clear"): void
  (e: "update:mobileOpen", value: boolean): void
}>()

const selectedCount = computed(() => props.selected.length)
const hasSelection = computed(() => selectedCount.value > 0)
const actionLabel = computed(() => (hasSelection.value ? "Reset" : "Vše"))

function toggleSheet() {
  emit("update:mobileOpen", !props.mobileOpen)
}

function tagStyle(tag: string): CSSProperties {
  const theme = tagTheme(tag)
  return {
    "--tag-rgb": theme.rgb,
    "--tag-text": theme.text,
  }
}
</script>

<template>
  <button
    class="mobile-fab"
    type="button"
    :class="{ open: mobileOpen }"
    :aria-expanded="mobileOpen"
    aria-label="Otevřít tagy"
    @click="toggleSheet"
  >
    <UiIcon v-if="!mobileOpen" name="tags" :size="22" />
    <UiIcon v-else name="x" :size="22" />
    <span v-if="selectedCount" class="badge">{{ selectedCount }}</span>
  </button>

  <Transition name="sheet">
    <div v-if="mobileOpen" class="mobile-scrim" @click.self="emit('update:mobileOpen', false)">
      <section class="mobile-sheet" aria-label="Tagy">
        <header class="sheet-head">
          <div>
            <p class="sheet-kicker">Filtry</p>
            <h2 class="sheet-title">Tagy</h2>
          </div>
          <button class="clear-btn" :class="{ active: hasSelection }" type="button" :disabled="!hasSelection" @click="emit('clear')">
            {{ actionLabel }}
          </button>
        </header>

        <div class="chips">
          <button
            v-for="tag in tags"
            :key="tag"
            type="button"
            class="chip"
            :class="{ on: selected.includes(tag) }"
            :style="tagStyle(tag)"
            @click="emit('toggle', tag)"
          >
            {{ tag }}
          </button>
        </div>
      </section>
    </div>
  </Transition>

  <nav class="dock" aria-label="Filter apps by tag">
    <div class="dock-tags">
      <button
        v-for="tag in tags"
        :key="tag"
        class="chip"
        :class="{ on: selected.includes(tag) }"
        :style="tagStyle(tag)"
        @click="emit('toggle', tag)"
      >
        {{ tag }}
      </button>
    </div>

    <button
      class="dock-reset"
      :class="{ active: hasSelection }"
      type="button"
      @click="emit('clear')"
    >
      {{ actionLabel }}
    </button>
  </nav>
</template>

<style scoped>
.dock {
  position: fixed;
  left: 50%;
  bottom: calc(18px + env(safe-area-inset-bottom));
  z-index: 25;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(1120px, calc(100vw - 28px));
  min-height: 48px;
  padding: 4px 6px 4px 8px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025)),
    rgba(15, 15, 18, 0.68);
  backdrop-filter: blur(30px) saturate(170%);
  -webkit-backdrop-filter: blur(30px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 18px 44px -24px rgba(0, 0, 0, 0.60),
    0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.dock-tags {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-left: 2px;
}

.chip {
  flex: 0 1 auto;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  text-transform: capitalize;
  color: var(--text);
  background: rgba(var(--tag-rgb), 0.10);
  border: 1px solid rgba(var(--tag-rgb), 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(var(--tag-rgb), 0.04);
  transition:
    color        0.20s var(--ease),
    background   0.20s var(--ease),
    border-color 0.20s var(--ease),
    box-shadow   0.20s var(--ease),
    transform    0.20s var(--ease);
}

.chip:hover:not(.on) {
  color: var(--text);
  background: rgba(var(--tag-rgb), 0.16);
  border-color: rgba(var(--tag-rgb), 0.30);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(var(--tag-rgb), 0.06),
    0 0 18px rgba(var(--tag-rgb), 0.12);
  transform: translateY(-1px);
}

.chip:active {
  transform: translateY(0) scale(0.97);
}

.chip.on {
  color: var(--tag-text);
  background:
    linear-gradient(180deg, rgba(var(--tag-rgb), 1), rgba(var(--tag-rgb), 0.76));
  border-color: rgba(var(--tag-rgb), 0.72);
  box-shadow:
    0 10px 22px -16px rgba(var(--tag-rgb), 0.72),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.dock-reset {
  flex-shrink: 0;
  min-width: 86px;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.84);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition:
    color        0.20s var(--ease),
    background   0.20s var(--ease),
    border-color 0.20s var(--ease),
    transform    0.20s var(--ease),
    box-shadow   0.20s var(--ease);
}

.dock-reset:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.14);
}

.dock-reset.active {
  color: #ff6262;
  background: rgba(255, 72, 72, 0.10);
  border-color: rgba(255, 79, 79, 0.92);
  box-shadow:
    0 10px 22px -16px rgba(255, 72, 72, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.mobile-fab,
.mobile-scrim,
.mobile-sheet {
  display: none;
}

:root[data-theme="light"] .dock {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 248, 252, 0.78)),
    rgba(255, 255, 255, 0.82);
  border-color: rgba(17, 20, 35, 0.10);
  box-shadow:
    0 18px 44px -24px rgba(17, 20, 35, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.30),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}
:root[data-theme="light"] .chip {
  color: var(--text);
}
:root[data-theme="light"] .chip:hover:not(.on) {
  color: var(--text);
}
:root[data-theme="light"] .chip.on {
  color: var(--tag-text);
}
:root[data-theme="light"] .dock-reset {
  color: rgba(17, 20, 35, 0.76);
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .dock-reset:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(17, 20, 35, 0.14);
}
:root[data-theme="light"] .dock-reset.active {
  color: #e63f3f;
  background: rgba(255, 72, 72, 0.10);
  border-color: rgba(255, 72, 72, 0.92);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s var(--ease);
}

.sheet-enter-active .mobile-sheet,
.sheet-leave-active .mobile-sheet {
  transition: transform 0.24s var(--ease), opacity 0.22s var(--ease);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .mobile-sheet,
.sheet-leave-to .mobile-sheet {
  transform: translateY(18px) scale(0.98);
  opacity: 0;
}

@media (max-width: 720px) {
  .dock {
    display: none;
  }

  .mobile-fab {
    position: fixed;
    right: calc(14px + env(safe-area-inset-right));
    bottom: calc(14px + env(safe-area-inset-bottom));
    z-index: 45;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    color: #fff;
    background: rgba(18, 18, 28, 0.84);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow:
      0 18px 34px -16px rgba(0, 0, 0, 0.65),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .mobile-fab.open {
    background: rgba(var(--c-rgb), 0.92);
  }

  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: rgba(var(--c-rgb), 1);
    border: 2px solid rgba(10, 10, 18, 0.9);
  }

  .mobile-scrim {
    position: fixed;
    inset: 0;
    z-index: 44;
    display: block;
    background: rgba(0, 0, 0, 0.30);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .mobile-sheet {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(76px + env(safe-area-inset-bottom));
    display: block;
    padding: 16px;
    border-radius: 24px;
    background: rgba(10, 10, 18, 0.84);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.75);
  }

  .sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .sheet-kicker {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 3px;
  }

  .sheet-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }

  .clear-btn {
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.82);
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.10);
  }

  .clear-btn.active {
    color: #ff6262;
    background: rgba(255, 72, 72, 0.10);
    border-color: rgba(255, 79, 79, 0.92);
  }

  .clear-btn:disabled {
    opacity: 0.55;
    cursor: default;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: min(50dvh, 360px);
    overflow: auto;
    padding-right: 2px;
  }

  :root[data-theme="light"] .mobile-fab {
    color: var(--text);
    background: rgba(255, 255, 255, 0.86);
    border-color: rgba(17, 20, 35, 0.10);
    box-shadow:
      0 18px 34px -16px rgba(17, 20, 35, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.70);
  }

  :root[data-theme="light"] .mobile-fab.open {
    color: #fff;
  }

  :root[data-theme="light"] .mobile-sheet {
    background: rgba(255, 255, 255, 0.86);
    border-color: rgba(17, 20, 35, 0.10);
    box-shadow: 0 24px 60px -24px rgba(17, 20, 35, 0.22);
  }

  :root[data-theme="light"] .sheet-title {
    color: var(--text);
  }

  :root[data-theme="light"] .clear-btn {
    color: rgba(17, 20, 35, 0.76);
    background: rgba(255, 255, 255, 0.84);
    border-color: rgba(17, 20, 35, 0.10);
  }

  :root[data-theme="light"] .clear-btn.active {
    color: #e63f3f;
    background: rgba(255, 72, 72, 0.10);
    border-color: rgba(255, 72, 72, 0.92);
  }
}

@media (min-width: 721px) {
  .mobile-fab,
  .mobile-scrim,
  .mobile-sheet {
    display: none !important;
  }
}
</style>
