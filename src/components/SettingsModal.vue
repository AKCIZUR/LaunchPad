<script setup lang="ts">
import { computed } from "vue"

type Theme = "dark" | "light"
type Language = "cz" | "en"

const props = defineProps<{
  open: boolean
  theme: Theme
  language: Language
  iconSize: number
  gridMin: number
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (e: "update:theme", value: Theme): void
  (e: "update:language", value: Language): void
  (e: "update:iconSize", value: number): void
  (e: "update:gridMin", value: number): void
}>()

const ui = computed(() => props.language === "cz"
  ? {
      title: "Nastavení",
      close: "Zavřít",
      appearance: "Režim",
      mode: "Vzhled",
      language: "Jazyk",
      grid: "Mřížka aplikací",
      icon: "Velikost ikon",
      dark: "Tmavý",
      light: "Světlý",
      cz: "Čeština",
      en: "Angličtina",
      glass: "Glass + kontrast",
      toggles: "CZ / EN",
    }
  : {
      title: "Settings",
      close: "Close",
      appearance: "Mode",
      mode: "Appearance",
      language: "Language",
      grid: "App grid",
      icon: "Icon size",
      dark: "Dark",
      light: "Light",
      cz: "Czech",
      en: "English",
      glass: "Glass + contrast",
      toggles: "CZ / EN",
    }
)
</script>

<template>
  <Transition name="settings">
    <div v-if="open" class="scrim" @click.self="emit('update:open', false)">
      <section class="panel" role="dialog" aria-modal="true" :aria-label="ui.title">
        <header class="head">
          <div>
            <p class="kicker">{{ ui.mode }}</p>
            <h2 class="title">{{ ui.title }}</h2>
          </div>
          <button class="close" type="button" @click="emit('update:open', false)">{{ ui.close }}</button>
        </header>

        <div class="rows">
          <div class="row">
            <div class="row-meta">
              <span class="row-label">{{ ui.appearance }}</span>
              <span class="row-desc">{{ ui.glass }}</span>
            </div>
            <div class="segmented">
              <button class="seg-btn" :class="{ on: theme === 'dark' }" @click="emit('update:theme', 'dark')">{{ ui.dark }}</button>
              <button class="seg-btn" :class="{ on: theme === 'light' }" @click="emit('update:theme', 'light')">{{ ui.light }}</button>
            </div>
          </div>

          <div class="row">
            <div class="row-meta">
              <span class="row-label">{{ ui.language }}</span>
              <span class="row-desc">{{ ui.toggles }}</span>
            </div>
            <div class="segmented">
              <button class="seg-btn" :class="{ on: language === 'cz' }" @click="emit('update:language', 'cz')">{{ ui.cz }}</button>
              <button class="seg-btn" :class="{ on: language === 'en' }" @click="emit('update:language', 'en')">{{ ui.en }}</button>
            </div>
          </div>

          <div class="slider-row">
            <div class="slider-head">
              <span class="row-label">{{ ui.grid }}</span>
              <span class="slider-value">{{ gridMin }} px</span>
            </div>
            <input
              class="range"
              type="range"
              min="92"
              max="140"
              step="2"
              :value="gridMin"
              @input="emit('update:gridMin', Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <div class="slider-row">
            <div class="slider-head">
              <span class="row-label">{{ ui.icon }}</span>
              <span class="slider-value">{{ iconSize }} px</span>
            </div>
            <input
              class="range"
              type="range"
              min="72"
              max="96"
              step="2"
              :value="iconSize"
              @input="emit('update:iconSize', Number(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 58;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
}

.panel {
  width: min(560px, 94vw);
  padding: 20px;
  border-radius: 32px;
  background: rgba(13, 13, 21, 0.54);
  backdrop-filter: blur(42px) saturate(180%);
  -webkit-backdrop-filter: blur(42px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 44px 96px -30px rgba(0, 0, 0, 0.60),
    0 10px 28px -12px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.kicker {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 4px;
}
.title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.close {
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.rows {
  display: grid;
  gap: 12px;
}
.row,
.slider-row {
  padding: 14px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.048);
  border: 1px solid rgba(255, 255, 255, 0.10);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.row-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.row-label,
.slider-head .row-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.row-desc {
  font-size: 11.5px;
  color: var(--text-faint);
}
.segmented {
  display: inline-flex;
  padding: 4px;
  gap: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.seg-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-muted);
  background: transparent;
  transition: background 0.18s var(--ease), color 0.18s var(--ease), transform 0.18s var(--ease);
}
.seg-btn.on {
  color: #fff;
  background: linear-gradient(180deg, #000 0%, #111 100%);
}
.seg-btn:active {
  transform: scale(0.96);
}

.slider-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.slider-value {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
}

.range {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 34px;
  background: transparent;
}

.range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--c-rgb), 0.92), rgba(var(--c-rgb), 0.35));
}
.range::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--c-rgb), 0.92), rgba(var(--c-rgb), 0.35));
}
.range::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border-radius: 6px;
  transform: rotate(45deg);
  background: #fff;
  border: 3px solid rgba(var(--c-rgb), 1);
  box-shadow: 0 8px 20px -12px rgba(0,0,0,0.8);
}
.range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  transform: rotate(45deg);
  background: #fff;
  border: 3px solid rgba(var(--c-rgb), 1);
  box-shadow: 0 8px 20px -12px rgba(0,0,0,0.8);
}


:root[data-theme="light"] .scrim {
  background: rgba(10, 10, 28, 0.16);
}
:root[data-theme="light"] .panel {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(17, 20, 35, 0.10);
  box-shadow:
    0 44px 96px -30px rgba(17, 20, 35, 0.20),
    0 10px 28px -12px rgba(17, 20, 35, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}
:root[data-theme="light"] .title,
:root[data-theme="light"] .row-label,
:root[data-theme="light"] .slider-head .row-label,
:root[data-theme="light"] .close {
  color: var(--text);
}
:root[data-theme="light"] .row-desc,
:root[data-theme="light"] .kicker,
:root[data-theme="light"] .slider-value {
  color: var(--text-muted);
}
:root[data-theme="light"] .row,
:root[data-theme="light"] .slider-row {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .segmented {
  background: rgba(17, 20, 35, 0.06);
  border-color: rgba(17, 20, 35, 0.08);
}
:root[data-theme="light"] .seg-btn {
  color: var(--text-muted);
}
:root[data-theme="light"] .seg-btn.on {
  color: #fff;
  background: linear-gradient(180deg, #000 0%, #111 100%);
}
:root[data-theme="light"] .close {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .range::-webkit-slider-runnable-track,
:root[data-theme="light"] .range::-moz-range-track {
  background: linear-gradient(90deg, rgba(var(--c-rgb), 0.95), rgba(var(--c-rgb), 0.40));
}
:root[data-theme="light"] .range::-webkit-slider-thumb,
:root[data-theme="light"] .range::-moz-range-thumb {
  background: #fff;
  box-shadow: 0 8px 20px -12px rgba(17, 20, 35, 0.36);
}

.settings-enter-active { transition: opacity 0.24s var(--ease-out); }
.settings-leave-active { transition: opacity 0.16s var(--ease-in); }
.settings-enter-from,
.settings-leave-to { opacity: 0; }
.settings-enter-active .panel {
  transition: transform 0.30s var(--ease), opacity 0.24s var(--ease-out);
}
.settings-leave-active .panel {
  transition: transform 0.18s var(--ease-in), opacity 0.16s var(--ease-in);
}
.settings-enter-from .panel {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
.settings-leave-to .panel {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}

@media (max-width: 540px) {
  .panel { padding: 16px; border-radius: 26px; }
  .row, .slider-row { padding: 12px; }
  .row { align-items: start; flex-direction: column; }
  .segmented { width: 100%; justify-content: stretch; }
  .seg-btn { flex: 1; }
}
</style>
