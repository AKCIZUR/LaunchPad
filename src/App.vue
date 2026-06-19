<template>
  <main class="shell">
    <section class="stage" aria-label="Aplikace">
      <div class="hub">
        <p class="section-label">Aplikace</p>

        <TransitionGroup name="card" tag="div" class="grid">
          <AppCard
            v-for="(app, index) in filteredApps"
            :key="app.id"
            :app="app"
            :snapshot="traffic.getSnapshot(app.id)"
            :style="{ '--delay': `${index * 22}ms` }"
            @select="select(app)"
          />
        </TransitionGroup>
      </div>
    </section>

    <nav class="dock desktop-dock" aria-label="Filtry aplikací">
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

    <button
      class="search-trigger floating-search"
      type="button"
      aria-label="Otevřít hledání"
      @click="openSearch"
    >
      <Search :size="18" />
    </button>

    <button
      class="mobile-filter-trigger"
      type="button"
      aria-label="Otevřít tagy"
      @click="openFilters"
    >
      <SlidersHorizontal :size="18" />
    </button>

    <Transition name="fade">
      <div v-if="filtersOpen" class="filters-overlay" @click.self="filtersOpen = false">
        <section class="filters-panel" role="dialog" aria-modal="true" aria-label="Tagy aplikací">
          <div class="filters-head">
            <div>
              <p class="overlay-kicker">Tagy</p>
              <h3>Vyber filtr</h3>
            </div>

            <button class="search-trigger modal-close" type="button" aria-label="Zavřít" @click="filtersOpen = false">
              <X :size="16" />
            </button>
          </div>

          <div class="pill-cloud">
            <button
              v-for="tag in tags"
              :key="tag"
              class="pill"
              :class="{ active: activeTag === tag }"
              type="button"
              @click="setTag(tag)"
            >
              {{ tag === 'all' ? 'Vše' : tag }}
            </button>
          </div>
        </section>
      </div>
    </Transition>

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
              @keydown.enter.prevent="openFirstResult"
            />
            <button v-if="query" class="ghost clear-search" type="button" aria-label="Vymazat hledání" @click="query = ''">
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
import {
  Search,
  X,
  SlidersHorizontal,
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
import AppCard from './components/AppCard.vue'
import AppModal from './components/AppModal.vue'
import { loadCSV } from './lib/csv'
import { createTrafficModel } from './lib/simulate'

const apps = ref([])
const query = ref('')
const activeTag = ref('all')
const selectedApp = ref(null)
const searchOpen = ref(false)
const filtersOpen = ref(false)
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

function setTag(tag) {
  activeTag.value = tag
  filtersOpen.value = false
}

function openSearch() {
  filtersOpen.value = false
  searchOpen.value = true
  window.setTimeout(() => searchRef.value?.focus(), 50)
}

function closeSearch() {
  searchOpen.value = false
}

function openFilters() {
  searchOpen.value = false
  filtersOpen.value = true
}

function pickFromSearch(app) {
  closeSearch()
  selectedApp.value = app
}

function openFirstResult() {
  const first = searchResults.value[0]
  if (!first) return
  pickFromSearch(first)
}

function onKeydown(e) {
  const key = e.key.toLowerCase()
  const isTypingTarget = ['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())

  if ((e.ctrlKey || e.metaKey) && key === 'k') {
    e.preventDefault()
    openSearch()
    return
  }

  if (key === '/' && !isTypingTarget) {
    e.preventDefault()
    openSearch()
    return
  }

  if (e.key === 'Escape') {
    if (searchOpen.value) closeSearch()
    else if (filtersOpen.value) filtersOpen.value = false
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
