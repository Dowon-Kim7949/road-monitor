export const krds_helpPanel = {
  init(): void {
    const helpPanel = document.querySelector('[data-help-panel]') as HTMLElement | null
    const openTrigger = document.querySelector('[data-help-open]') as HTMLElement | null
    const closeTrigger = helpPanel?.querySelector('[data-help-close]') as HTMLElement | null

    if (!helpPanel || !openTrigger || !closeTrigger) return

    openTrigger.addEventListener('click', () => this.open(helpPanel, openTrigger))
    closeTrigger.addEventListener('click', () => this.close(helpPanel, openTrigger))

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!helpPanel.contains(target) && !openTrigger.contains(target)) {
        this.close(helpPanel, openTrigger)
      }
    })
  },

  open(panel: HTMLElement, opener: HTMLElement): void {
    panel.classList.add('is-open')
    panel.setAttribute('aria-hidden', 'false')
    opener.setAttribute('aria-expanded', 'true')
    document.body.classList.add('is-help-panel-open')

    // inert 처리 (접근성용)
    document.querySelector('#container')?.setAttribute('inert', '')
    document.querySelector('#footer')?.setAttribute('inert', '')
    document.querySelector('#krds-header')?.setAttribute('inert', '')

    const firstFocusable = panel.querySelector<HTMLElement>('a, button, input, [tabindex="0"]')
    firstFocusable?.focus()
  },

  close(panel: HTMLElement, opener: HTMLElement): void {
    panel.classList.remove('is-open')
    panel.setAttribute('aria-hidden', 'true')
    opener.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('is-help-panel-open')

    document.querySelector('#container')?.removeAttribute('inert')
    document.querySelector('#footer')?.removeAttribute('inert')
    document.querySelector('#krds-header')?.removeAttribute('inert')

    opener.focus()
  },
}
