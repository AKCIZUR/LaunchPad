<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="app" class="modal-backdrop" @click.self="$emit('close')">
        <Transition name="sheet">
          <section class="modal" role="dialog" aria-modal="true" :aria-label="app.name">
            <header class="modal-head">
              <div class="modal-titleblock">
                <div class="icon" :class="`icon-${app.color}`">
                  <component :is="iconComponent" />
                </div>
                <div>
                  <h2>{{ app.name }}</h2>
                  <p>{{ app.desc }}</p>
                </div>
              </div>

              <button class="search-trigger modal-close" type="button" aria-label="Zavřít" @click="$emit('close')">
                <X :size="16" />
              </button>
            </header>

            <div class="tags">
              <span v-for="tag in app.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="url-box">
              <input :value="app.url" readonly />
              <button class="ghost copy" type="button" @click="copy">
                <component :is="copied ? Check : Copy" :size="16" />
              </button>
            </div>

            <footer class="modal-actions">
              <button class="secondary" type="button" @click="$emit('close')">Zavřít</button>
              <a class="primary" :href="app.url" target="_blank" rel="noreferrer">
                Otevřít
                <ExternalLink :size="16" />
              </a>
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Check, Copy, ExternalLink, X, Activity, Cloud, FileText, Globe, LayoutGrid, MessageCircle, Music, PhoneCall, PlayCircle, Users, Video, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  app: { type: Object, default: null },
})

defineEmits(['close'])

const copied = ref(false)

const iconMap = {
  video: Video,
  users: Users,
  'layout-grid': LayoutGrid,
  'message-circle': MessageCircle,
  'phone-call': PhoneCall,
  'play-circle': PlayCircle,
  music: Music,
  globe: Globe,
  cloud: Cloud,
  'file-text': FileText,
  activity: Activity,
  sparkles: Sparkles,
}

const iconComponent = computed(() => iconMap[props.app?.icon] || Sparkles)

async function copy() {
  if (!props.app?.url) return
  try {
    await navigator.clipboard.writeText(props.app.url)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    copied.value = false
  }
}
</script>
