// composables/useDropdownControl.ts
import { ref, onBeforeUnmount } from 'vue'

const openMenu = ref<string | null>(null)

export function useDropdownControl(id: string) {
  const isOpen = () => openMenu.value === id
  const toggle = () => {
    openMenu.value = isOpen() ? null : id
  }
  const close = () => {
    if (openMenu.value === id) openMenu.value = null
  }

  const onClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest(`[data-dropdown="${id}"]`)) {
      close()
    }
  }

  document.addEventListener('click', onClickOutside)
  onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
  })

  return {
    isOpen,
    toggle,
  }
}
