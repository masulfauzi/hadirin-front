import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '../stores/menu.store'

export function useMenuPermission() {
  const route = useRoute()
  const menu = useMenuStore()

  return computed(() => {
    const perm = menu.permissionFor(route.path)
    return {
      canRead: perm?.can_read ?? true,
      canInsert: perm?.can_insert ?? true,
      canUpdate: perm?.can_update ?? true,
      canDelete: perm?.can_delete ?? true,
    }
  })
}
