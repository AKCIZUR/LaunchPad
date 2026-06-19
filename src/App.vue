<template>
  <main class="shell">
    <header class="topbar" aria-label="Ovládání">
      <button class="search-trigger" type="button" aria-label="Otevřít hledání" @click="openSearch">
        <Search :size="18" />
      </button>
    </header>

    <section class="stage">
      <div class="hub">
        <p class="section-label">Aplikace</p>

        <TransitionGroup name="card" tag="div" class="grid">
          <AppCard
            v-for="app in filteredApps"
            :key="app.id"
            :app="app"
            :snapshot="traffic.getSnapshot(app.id)"
            @select="select(app)"
          />
        </TransitionGroup>
      </div>
    </section>

    <nav class="dock" aria-label="Filtry aplikací">
      <button
        v-for="tag in tags"
        :key="tag"
        class="chip"
        :class="{ active: activeTag === tag }"
        type="button"
        @click="activeTag = tag"
      >
        {{ tag === 'all' ? 'Vše' : tag }}
      </button>
    </nav>

    <Transition name="fade">
      <div v-if="searchOpen" class="search-overlay" @click.self="closeSearch">
        <section class="search-sheet" role="dialog" aria-modal="true" aria-label="Hledání aplikací">
          <div class="search-field">
            <Search :size="18" />
            <input
              ref="searchRef"
              v-model="query"
              type="text"
              placeholder="Hledat aplikace, tagy…"
              @keydown.esc="closeSearch"
            />
            <button v-if="query" class="ghost" type="button" @click="query = ''">
              <X :size="16" />
            </button>
          </div>

          <div class="search-results">
            <button
              v-for="app in searchResults"
              :key="app.id"
              class="search-row"
              type="button"
              @click="pickFromSearch(app)"
            >
              <span class="row-icon" :class="`icon-${app.color}`">
                <component :is="iconFor(app.icon)" />
              </span>
              <span class="row-copy">
                <strong>{{ app.name }}</strong>
                <span>{{ app.desc }}</span>
              </span>
            </button>

            <div v-if="query && !searchResults.length" class="empty-state">
              Nic tady nebliká. Zkus jiný výraz.
            </div>
          </div>
        </section>
      </div>
    </Transition>

    <AppModal
      :app="selectedApp"
      @close="selectedApp = null"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Search, X, Activity, Cloud, FileText, Globe, LayoutGrid, MessageCircle, Music, PhoneCall, PlayCircle, Users, Video, Sparkles } from 'lucide-vue-next'
import AppCard from './components/AppCard.vue'
import AppModal from './components/AppModal.vue'
import { loadCSV } from './lib/csv'
import { createTrafficModel } from './lib/simulate'

const apps = ref([])
const query = ref('')
const activeTag = ref('all')
const selectedApp = ref(null)
const searchOpen = ref(false)
const searchRef = ref(null)
const traffic = ref(null)

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

const iconFor = (name) => iconMap[name] || Sparkles

const tags = computed(() => {
  const set = new Set(['all'])
  for (const app of apps.value) {
    for (const tag of app.tags || []) set.add(tag)
  }
  return [...set]
})

const filteredApps = computed(() => {
  const q = query.value.trim().toLowerCase()
  return [...apps.value]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .filter((app) => {
      const matchesTag = activeTag.value === 'all' || app.tags.includes(activeTag.value)
      const haystack = `${app.name} ${app.desc} ${app.tags.join(' ')} ${app.status}`.toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      return matchesTag && matchesQuery
    })
})

const searchResults = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return apps.value.slice(0, 8)
  return apps.value.filter((app) => {
    const haystack = `${app.name} ${app.desc} ${app.tags.join(' ')}`.toLowerCase()
    return haystack.includes(q)
  })
})

function select(app) {
  selectedApp.value = app
}

function openSearch() {
  searchOpen.value = true
  window.setTimeout(() => searchRef.value?.focus(), 50)
}

function closeSearch() {
  searchOpen.value = false
}

function pickFromSearch(app) {
  closeSearch()
  selectedApp.value = app
}

function onKeydown(e) {
  if (e.key === '/' && document.activeElement !== searchRef.value) {
    e.preventDefault()
    openSearch()
  }
  if (e.key === 'Escape') {
    if (searchOpen.value) closeSearch()
    else if (selectedApp.value) selectedApp.value = null
  }
}

onMounted(async () => {
  const rows = await loadCSV('/data/apps.csv')
  apps.value = rows.map((row) => ({
    id: row.id,
    name: row.name,
    desc: row.desc,
    url: row.url,
    icon: row.icon,
    color: row.color,
    tags: (row.tags || '').split('|').map((t) => t.trim()).filter(Boolean),
    status: row.status,
    baseUsers: Number(row.baseUsers || 0),
    baseLatency: Number(row.baseLatency || 0),
    lastSeen: row.lastSeen,
    featured: row.featured === 'true',
  }))

  traffic.value = createTrafficModel(apps.value)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  traffic.value?.stop?.()
})
</script>
