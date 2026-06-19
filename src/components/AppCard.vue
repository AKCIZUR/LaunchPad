<template>
  <button class="card" type="button" @click="$emit('select')">
    <div class="card-icon-wrap">
      <div class="card-glow" :style="{ opacity: 0.10 + snapshot.glow * 0.12 }"></div>
      <div class="icon-shell">
        <div class="icon" :class="`icon-${app.color}`">
          <component :is="iconComponent" />
        </div>
      </div>
    </div>

    <h3>{{ app.name }}</h3>
    <p>{{ app.desc }}</p>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import {
  Activity,
  Cloud,
  FileText,
  Globe,
  LayoutGrid,
  MessageCircle,
  Music,
  PhoneCall,
  PlayCircle,
  Sparkles,
  Users,
  Video,
} from 'lucide-vue-next'

const props = defineProps({
  app: { type: Object, required: true },
  snapshot: { type: Object, required: true },
})

defineEmits(['select'])

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

const iconComponent = computed(() => iconMap[props.app.icon] || Sparkles)
</script>
