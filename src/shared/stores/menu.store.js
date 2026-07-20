import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuService } from '../services/menu.service'

function flatten(nodes, map) {
  for (const node of nodes) {
    if (node.route) {
      map[node.route] = {
        can_read: node.can_read,
        can_insert: node.can_insert,
        can_update: node.can_update,
        can_delete: node.can_delete,
      }
    }
    if (node.children?.length) flatten(node.children, map)
  }
}

export const useMenuStore = defineStore('menu', () => {
  const tree = ref([])
  const permissions = ref({})
  const loaded = ref(false)
  const loading = ref(false)
  let pending = null

  function fetchMenu() {
    if (loaded.value) return Promise.resolve()
    if (pending) return pending

    loading.value = true
    pending = menuService
      .me()
      .then(({ data }) => {
        tree.value = data
        const map = {}
        flatten(data, map)
        permissions.value = map
        loaded.value = true
      })
      .catch((err) => {
        // Gagal memuat menu (mis. backend down) tidak boleh mengunci user total
        // dari aplikasi -- canAccess() akan fail-open selama loaded tetap false.
        console.error('Gagal memuat menu:', err)
      })
      .finally(() => {
        loading.value = false
        pending = null
      })
    return pending
  }

  function reset() {
    tree.value = []
    permissions.value = {}
    loaded.value = false
  }

  function canAccess(path) {
    if (!loaded.value) return true
    return Object.prototype.hasOwnProperty.call(permissions.value, path)
  }

  function permissionFor(path) {
    return permissions.value[path] ?? null
  }

  return { tree, permissions, loaded, loading, fetchMenu, reset, canAccess, permissionFor }
})
