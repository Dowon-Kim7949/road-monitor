export const common = {
  focusTrap(trap: HTMLElement): void {
    const focusableSelectors = 'a, button, [tabindex="0"], input, textarea, select'
    const focusableElements = trap.querySelectorAll<HTMLElement>(focusableSelectors)

    if (!focusableElements.length) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Tab') {
        const activeElement = document.activeElement as HTMLElement

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        } else if (event.shiftKey && activeElement === trap) {
          event.preventDefault()
          lastElement.focus()
        }
      }
    }
    trap.addEventListener('keydown', handleKeyDown)
  },
}
