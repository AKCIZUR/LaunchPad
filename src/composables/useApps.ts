import { computed, ref } from "vue"
import data from "@/data/apps.json"
import type { AppEntry } from "@/types"

const apps = ref<AppEntry[]>(data.apps as AppEntry[])

export function useApps() {
  const allTags = computed(() => {
    const set = new Set<string>()
    apps.value.forEach((a) => a.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  })

  function filterBy(query: string, tags: string[] | null): AppEntry[] {
    const q = query.trim().toLowerCase()
    const activeTags = (tags ?? []).filter(Boolean)
    return apps.value.filter((a) => {
      const matchesTag = activeTags.length === 0 || activeTags.some((tag) => a.tags.includes(tag))
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      return matchesTag && matchesQuery
    })
  }

  return { apps, allTags, filterBy }
}
