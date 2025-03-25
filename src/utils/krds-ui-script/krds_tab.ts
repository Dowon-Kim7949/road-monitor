export const krds_tab = {
  layerTabArea: null as NodeListOf<HTMLElement> | null,

  init(): void {
    this.layerTabArea = document.querySelectorAll('.krds-tab-area.layer')
    if (!this.layerTabArea.length) return

    this.setupTabs()
  },

  setupTabs(): void {
    this.layerTabArea?.forEach((tabArea) => {
      const layerTabs = tabArea.querySelectorAll('.tab > ul > li') as NodeListOf<HTMLElement>

      layerTabs.forEach((tab) => {
        if (tab.dataset.listenerAttached) return

        const controlId = tab.getAttribute('aria-controls')
        const selectedTabPanel = controlId ? document.getElementById(controlId) : null

        tab.setAttribute('aria-selected', 'false')
        tab.setAttribute('role', 'tab')
        selectedTabPanel?.setAttribute('role', 'tabpanel')

        if (tab.classList.contains('active')) {
          const button = tab.querySelector('button')
          if (button && !button.querySelector('.sr-only')) {
            tab.setAttribute('aria-selected', 'true')
            button.append(this.createAccText())
          }
        }

        tab.addEventListener('click', () => {
          const closestTabs = tab
            .closest('.krds-tab-area.layer > .tab')
            ?.querySelectorAll('li') as NodeListOf<HTMLElement>
          const closestTabPanels = tab
            .closest('.krds-tab-area.layer')
            ?.querySelectorAll('.tab-conts-wrap > .tab-conts') as NodeListOf<HTMLElement>

          this.resetTabs(closestTabs, closestTabPanels)

          tab.classList.add('active')
          const button = tab.querySelector('button')
          button?.append(this.createAccText())
          tab.setAttribute('aria-selected', 'true')

          selectedTabPanel?.classList.add('active')
        })

        this.setupKeyboardNavigation(tab)

        tab.dataset.listenerAttached = 'true'
      })
    })
  },

  createAccText(): HTMLElement {
    const el = document.createElement('i')
    el.classList.add('sr-only')
    el.textContent = '선택됨'
    return el
  },

  resetTabs(tabs: NodeListOf<HTMLElement>, tabPanels: NodeListOf<HTMLElement>): void {
    tabs.forEach((tab) => {
      tab.classList.remove('active')
      tab.setAttribute('aria-selected', 'false')

      const srOnly = tab.querySelector('.sr-only')
      const button = tab.querySelector('button')
      if (srOnly && button) {
        button.removeChild(srOnly)
      }
    })

    tabPanels.forEach((panel) => panel.classList.remove('active'))
  },

  setupKeyboardNavigation(tab: HTMLElement): void {
    tab.addEventListener('keydown', (event: KeyboardEvent) => {
      let newTabButton: HTMLButtonElement | null | undefined

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        newTabButton = tab.nextElementSibling?.querySelector('button') as HTMLButtonElement | null
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        newTabButton = tab.previousElementSibling?.querySelector(
          'button',
        ) as HTMLButtonElement | null
      }

      newTabButton?.focus()
    })
  },
}
