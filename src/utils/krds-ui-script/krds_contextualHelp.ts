export const krds_contextualHelp = {
  init(): void {
    const helpButtons = document.querySelectorAll(
      '[data-contextual-help-trigger]',
    ) as NodeListOf<HTMLElement>

    helpButtons.forEach((button) => {
      const targetId = button.getAttribute('data-contextual-help-trigger')
      if (!targetId) return
      const helpContent = targetId ? document.getElementById(targetId) : null
      if (!helpContent) return

      button.setAttribute('aria-controls', targetId)
      button.setAttribute('aria-expanded', 'false')

      button.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation()
        const isActive = button.classList.contains('active')
        this.resetAll()

        if (!isActive) {
          button.classList.add('active')
          helpContent.classList.add('is-open')
          button.setAttribute('aria-expanded', 'true')
        }
      })
    })

    document.addEventListener('click', () => this.resetAll())
  },

  resetAll(): void {
    const activeButtons = document.querySelectorAll(
      '[data-contextual-help-trigger].active',
    ) as NodeListOf<HTMLElement>
    const activeContents = document.querySelectorAll(
      '.krds-contextual-help.is-open',
    ) as NodeListOf<HTMLElement>

    activeButtons.forEach((button) => {
      button.classList.remove('active')
      button.setAttribute('aria-expanded', 'false')
    })

    activeContents.forEach((content) => {
      content.classList.remove('is-open')
    })
  },
}
