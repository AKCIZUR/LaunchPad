<script setup lang="ts">
import { computed, ref, type CSSProperties } from "vue"
import { hexToRgb, resolveAppAccent, tagTheme } from "@/lib/color"
import AppIcon from "./AppIcon.vue"
import type { AppEntry } from "@/types"
import UiIcon from "./UiIcon.vue"

const props = defineProps<{ app: AppEntry | null; selectedTags: string[] }>()
const emit = defineEmits<{
  (e: "close"): void
  (e: "toggle-tag", tag: string): void
  (e: "clear-tags"): void
}>()
const copied = ref(false)

const accent = computed(() => (props.app ? resolveAppAccent(props.app) : "#5b8cff"))

function launch() {
  if (props.app) window.open(props.app.url, "_blank", "noopener,noreferrer")
}

async function copyUrl() {
  if (!props.app) return
  try {
    await navigator.clipboard.writeText(props.app.url)
  } catch {
    /* ignore */
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2200)
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
  <Transition name="modal">
    <div
      v-if="app"
      class="scrim"
      :style="{ '--c': accent, '--c-rgb': hexToRgb(accent) }"
      @click.self="emit('close')"
    >
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        :aria-label="app.name"
      >
        <div class="glow" aria-hidden="true" />

        <button class="close" aria-label="Zavřít" @click="emit('close')">
          <UiIcon name="x" :size="12" />
        </button>

        <div class="head">
          <AppIcon :app="app" :size="64" />
          <div class="head-text">
            <h2 class="app-name">{{ app.name }}</h2>
            <p class="tagline">{{ app.tagline }}</p>
          </div>
        </div>

        <div class="divider" />

        <p class="desc">{{ app.description }}</p>

        <div class="tags" v-if="app.tags.length">
          <button
            v-for="t in app.tags"
            :key="t"
            class="tag"
            :class="{ on: selectedTags.includes(t) }"
            type="button"
            :style="tagStyle(t)"
            @click="emit('toggle-tag', t)"
          >
            {{ t }}
          </button>
        </div>

        <div class="url-row">
          <div class="url-pill">
            <input
              type="text"
              class="url-input"
              :value="app.url"
              readonly
              spellcheck="false"
              aria-label="URL aplikace"
            />
            <button
              class="copy-btn"
              :class="{ copied }"
              :aria-label="copied ? 'Zkopírováno!' : 'Kopírovat URL'"
              @click="copyUrl"
            >
              <Transition name="icon-swap" mode="out-in">
                <UiIcon v-if="!copied" key="copy" name="copy" :size="14" />
                <UiIcon v-else key="check" name="check" :size="14" />
              </Transition>
            </button>
          </div>
        </div>

        <button class="launch" @click="launch">
          <span>Otevřít {{ app.name }}</span>
          <UiIcon name="external-link" :size="14" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(26px) saturate(170%);
  -webkit-backdrop-filter: blur(26px) saturate(170%);
}

.sheet {
  position: relative;
  width: min(420px, 92vw);
  padding: 26px;
  border-radius: var(--radius-xl);
  background: rgba(14, 14, 22, 0.20);
  backdrop-filter: blur(58px) saturate(220%);
  -webkit-backdrop-filter: blur(58px) saturate(220%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0  48px  96px -32px rgba(0, 0, 0, 0.55),
    0  16px  40px -16px rgba(0, 0, 0, 0.34),
    inset 0  1px  0    rgba(255, 255, 255, 0.12),
    inset 0 -1px  0    rgba(0, 0, 0, 0.14);
  overflow: hidden;
  will-change: transform, opacity;
}

.glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 340px;
  height: 220px;
  background: radial-gradient(
    ellipse at 50% 40%,
    rgba(var(--c-rgb), 0.34) 0%,
    rgba(var(--c-rgb), 0.08) 55%,
    transparent 72%
  );
  filter: blur(16px);
  pointer-events: none;
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition:
    color 0.18s var(--ease),
    background 0.18s var(--ease),
    border-color 0.18s var(--ease),
    transform 0.22s var(--ease);
  z-index: 2;
}
.close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.13);
  border-color: rgba(255, 255, 255, 0.20);
  transform: rotate(90deg) scale(1.08);
}
.close:active {
  transform: rotate(90deg) scale(0.94);
}

.head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
  padding-right: 52px;
}
.head-text { min-width: 0; }

.app-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tagline {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--c-rgb), 1);
  text-shadow: 0 1px 10px rgba(var(--c-rgb), 0.34);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin-bottom: 16px;
}

.desc {
  font-size: 13.5px;
  line-height: 1.68;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 20px;
}
.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  color: var(--text);
  background: rgba(var(--tag-rgb), 0.10);
  border: 1px solid rgba(var(--tag-rgb), 0.18);
  text-transform: capitalize;
  letter-spacing: 0.01em;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(var(--tag-rgb), 0.03);
  transition:
    color 0.18s var(--ease),
    background 0.18s var(--ease),
    border-color 0.18s var(--ease),
    transform 0.18s var(--ease),
    box-shadow 0.18s var(--ease);
}
.tag:hover {
  transform: translateY(-1px);
  background: rgba(var(--tag-rgb), 0.16);
  border-color: rgba(var(--tag-rgb), 0.30);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 0 18px rgba(var(--tag-rgb), 0.12);
}
.tag.on {
  color: var(--tag-text);
  background: linear-gradient(180deg, rgba(var(--tag-rgb), 1), rgba(var(--tag-rgb), 0.76));
  border-color: rgba(var(--tag-rgb), 0.74);
  box-shadow:
    0 10px 22px -16px rgba(var(--tag-rgb), 0.70),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.url-row {
  margin-bottom: 15px;
}

.url-pill {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  padding: 4px 4px 4px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.040);
  border: 1px solid rgba(255, 255, 255, 0.10);
  transition:
    border-color 0.18s var(--ease),
    background 0.18s var(--ease),
    transform 0.18s var(--ease);
}
.url-pill:hover {
  background: rgba(255, 255, 255, 0.060);
  border-color: rgba(255, 255, 255, 0.16);
}
.url-pill:focus-within {
  border-color: rgba(var(--c-rgb), 0.52);
  background: rgba(255, 255, 255, 0.070);
}

.url-input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px 6px 0;
  font-size: 12px;
  font-family: var(--font-mono);
  font-variant-ligatures: none;
  letter-spacing: 0.02em;
  color: var(--text-muted);
  background: transparent;
  border: none;
  outline: none;
  user-select: all;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.url-input:hover,
.url-input:focus {
  color: var(--text);
}

.copy-btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.050);
  border: 1px solid rgba(255, 255, 255, 0.10);
  transition:
    color 0.18s var(--ease),
    background 0.18s var(--ease),
    border-color 0.18s var(--ease),
    transform 0.16s var(--ease);
}
.copy-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.086);
  border-color: rgba(255, 255, 255, 0.16);
}
.copy-btn:active { transform: scale(0.90); }
.copy-btn.copied {
  color: rgba(var(--c-rgb), 1);
  border-color: rgba(var(--c-rgb), 0.38);
  background: rgba(var(--c-rgb), 0.10);
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 0.12s ease, transform 0.12s var(--ease);
}
.icon-swap-enter-from { opacity: 0; transform: scale(0.65) rotate(-20deg); }
.icon-swap-leave-to   { opacity: 0; transform: scale(0.65) rotate(20deg); }

.launch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.012em;
  border-radius: var(--radius);
  color: #fff;
  background:
    linear-gradient(140deg, rgba(58, 242, 120, 1.00) 0%, rgba(25, 193, 102, 1.00) 48%, rgba(15, 132, 70, 1.00) 100%);
  box-shadow:
    0 12px 32px -10px rgba(25, 193, 102, 0.62),
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    inset 0 -1px 0 rgba(0, 0, 0, 0.16);
  transition:
    transform 0.26s var(--ease),
    box-shadow 0.26s var(--ease),
    filter 0.26s var(--ease);
}
.launch:hover {
  transform: translateY(-2px);
  box-shadow:
    0 20px 48px -12px rgba(25, 193, 102, 0.78),
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    inset 0 -1px 0 rgba(0, 0, 0, 0.16);
  filter: brightness(1.05);
}
.launch:active {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.95);
}

:root[data-theme="light"] .scrim {
  background: rgba(10, 10, 28, 0.18);
}
:root[data-theme="light"] .sheet {
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(17, 20, 35, 0.12);
  box-shadow:
    0  48px  96px -32px rgba(17, 20, 35, 0.18),
    0  16px  40px -16px rgba(17, 20, 35, 0.12),
    inset 0  1px  0    rgba(255, 255, 255, 0.92),
    inset 0 -1px  0    rgba(17, 20, 35, 0.08);
}
:root[data-theme="light"] .divider {
  background: rgba(17, 20, 35, 0.08);
}
:root[data-theme="light"] .desc,
:root[data-theme="light"] .url-input,
:root[data-theme="light"] .tag {
  color: var(--text-muted);
}
:root[data-theme="light"] .url-pill,
:root[data-theme="light"] .copy-btn,
:root[data-theme="light"] .tag {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .url-pill:hover,
:root[data-theme="light"] .url-pill:focus-within,
:root[data-theme="light"] .copy-btn:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(17, 20, 35, 0.14);
}
:root[data-theme="light"] .launch {
  color: #fff;
}
:root[data-theme="light"] .close,
:root[data-theme="light"] .copy-btn {
  color: var(--text-muted);
}
:root[data-theme="light"] .close {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .copy-btn {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .tag.on {
  color: var(--tag-text);
}

@media (max-width: 520px) {
  .sheet {
    width: min(100vw - 20px, 420px);
    padding: 22px 18px 18px;
    border-radius: 24px;
  }

  .head {
    gap: 12px;
    padding-right: 46px;
  }

  .app-name {
    font-size: 18px;
  }

  .tagline {
    font-size: 12px;
  }

  .url-pill {
    padding-left: 12px;
  }

  .copy-btn {
    width: 30px;
    height: 30px;
  }

  .tags {
    gap: 5px;
    margin: 12px 0 18px;
  }

  .tag {
    font-size: 10.5px;
    padding: 3px 9px;
  }
}

.modal-enter-active {
  transition: opacity 0.26s var(--ease-out);
}
.modal-leave-active {
  transition: opacity 0.18s var(--ease-in);
}
.modal-enter-active .sheet {
  transition: transform 0.32s var(--ease), opacity 0.26s var(--ease-out);
}
.modal-leave-active .sheet {
  transition: transform 0.20s var(--ease-in), opacity 0.18s var(--ease-in);
}
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .sheet {
  transform: translateY(22px) scale(0.93);
  opacity: 0;
}
.modal-leave-to .sheet {
  transform: translateY(10px) scale(0.97);
  opacity: 0;
}
</style>
