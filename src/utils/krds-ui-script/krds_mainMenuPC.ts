export type Nullable<T> = T | null
export const krds_mainMenuPC = {
  backdrop: null as Nullable<HTMLElement>,

  init(): void {
    const gnbMenu = document.querySelector('.krds-main-menu:not(.sample) .gnb-menu') as HTMLElement
    if (!gnbMenu) return

    gnbMenu.setAttribute('aria-label', '메인 메뉴')
    this.backdrop = document.querySelector('.gnb-backdrop') || this.createBackdrop()

    const mainTriggers = gnbMenu.querySelectorAll('.gnb-main-trigger') as NodeListOf<HTMLElement>
    const subTriggers = gnbMenu.querySelectorAll(
      '.gnb-sub-trigger:not(.is-link)',
    ) as NodeListOf<HTMLElement>

    mainTriggers.forEach((mainTrigger) => this.setupMainTrigger(mainTrigger))
    this.attachEvents(mainTriggers, subTriggers)
    this.setupKeyboardNavigation(mainTriggers)
  },

  setupMainTrigger(mainTrigger: HTMLElement): void {
    const toggleWrap = mainTrigger.nextElementSibling as HTMLElement | null
    if (!toggleWrap) return

    const uniqueIdx = `gnb-main-menu-${Math.random().toString(36).substring(2, 9)}`
    mainTrigger.setAttribute('aria-controls', uniqueIdx)
    mainTrigger.setAttribute('aria-expanded', 'false')
    mainTrigger.setAttribute('aria-haspopup', 'true')
    toggleWrap.setAttribute('id', uniqueIdx)

    const mainList = toggleWrap.querySelector('.gnb-main-list')
    if (mainList?.getAttribute('data-has-submenu') === 'true') {
      const subTriggers = mainList.querySelectorAll('.gnb-sub-trigger') as NodeListOf<HTMLElement>
      subTriggers.forEach((subTrigger) => this.setupSubTrigger(subTrigger))
      if (subTriggers.length > 0 && !subTriggers[0].classList.contains('is-link')) {
        subTriggers[0].classList.add('active')
        subTriggers[0].setAttribute('aria-expanded', 'true')
        subTriggers[0].nextElementSibling?.classList.add('active')
      }
    }
  },

  setupSubTrigger(subTrigger: HTMLElement): void {
    const hasMenu = subTrigger.nextElementSibling as HTMLElement | null
    if (!hasMenu) return

    const uniqueIdx = `gnb-sub-menu-${Math.random().toString(36).substring(2, 9)}`
    subTrigger.setAttribute('aria-controls', uniqueIdx)
    subTrigger.setAttribute('aria-expanded', 'false')
    subTrigger.setAttribute('aria-haspopup', 'true')
    hasMenu.setAttribute('id', uniqueIdx)
  },

  toggleMainMenu(mainTrigger: HTMLElement): void {
    const isActive = mainTrigger.classList.contains('active')
    const isDropDown = mainTrigger.classList.contains('is-dropdown')
    const nextSibling = mainTrigger.nextElementSibling as HTMLElement | null

    if (!isActive && nextSibling) {
      this.resetMainMenu()
      mainTrigger.setAttribute('aria-expanded', 'true')
      mainTrigger.classList.add('active')
      nextSibling.classList.add('is-open')
      if (!isDropDown) {
        this.toggleBackdrop(true)
        this.toggleScrollbar(true)
        const list = nextSibling.querySelector('.gnb-main-list') as HTMLElement
        this.adjustSubMenuHeight(list)
      }
    } else {
      this.closeMainMenu()
    }
  },

  toggleSubMenu(subTrigger: HTMLElement): void {
    const ul = subTrigger.closest('ul')
    const others = ul?.querySelectorAll('.gnb-sub-trigger:not(.is-link)') as NodeListOf<HTMLElement>

    others?.forEach((trigger) => {
      trigger.classList.remove('active')
      trigger.setAttribute('aria-expanded', 'false')
      trigger.nextElementSibling?.classList.remove('active')
    })

    subTrigger.classList.add('active')
    subTrigger.setAttribute('aria-expanded', 'true')
    subTrigger.nextElementSibling?.classList.add('active')
    const list = subTrigger.closest('.gnb-main-list') as HTMLElement
    this.adjustSubMenuHeight(list)
  },

  createBackdrop(): HTMLElement {
    const backdrop = document.createElement('div')
    backdrop.classList.add('gnb-backdrop')
    document.body.appendChild(backdrop)
    return backdrop
  },

  toggleBackdrop(isOpen: boolean): void {
    this.backdrop?.classList.toggle('active', isOpen)
    document.body.classList.toggle('is-gnb-web', isOpen)
  },

  adjustSubMenuHeight(target: HTMLElement): void {
    const activeSubList = target.querySelector('.gnb-sub-list.active') as HTMLElement | null
    const height = activeSubList?.scrollHeight ?? 0
    target.style.minHeight = `${height}px`
  },

  toggleScrollbar(isEnabled: boolean): void {
    const isScrollNeeded = document.body.scrollHeight > window.innerHeight
    document.body.classList.toggle('hasScrollY', isEnabled && isScrollNeeded)
  },

  resetMainMenu(): void {
    const mainTriggers = document.querySelectorAll(
      '.krds-main-menu:not(.sample) .gnb-main-trigger:not(.is-link)',
    ) as NodeListOf<HTMLElement>
    mainTriggers.forEach((trigger) => {
      trigger.classList.remove('active')
      trigger.setAttribute('aria-expanded', 'false')
    })

    const toggleWraps = document.querySelectorAll(
      '.krds-main-menu:not(.sample) .gnb-toggle-wrap',
    ) as NodeListOf<HTMLElement>
    toggleWraps.forEach((wrap) => {
      wrap.classList.remove('is-open')
    })
  },

  closeMainMenu(): void {
    this.resetMainMenu()
    this.toggleBackdrop(false)
    this.toggleScrollbar(false)
  },

  attachEvents(mainTriggers: NodeListOf<HTMLElement>, subTriggers: NodeListOf<HTMLElement>): void {
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.krds-main-menu')) this.closeMainMenu()
    })

    document.addEventListener('keyup', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.code === 'Escape' || !target.closest('.krds-main-menu')) {
        this.closeMainMenu()
      }
    })

    mainTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.toggleMainMenu(trigger))
    })

    subTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.toggleSubMenu(trigger))
    })
  },

  setupKeyboardNavigation(mainTriggers: NodeListOf<HTMLElement>): void {
    const focusMenuItem = (el: HTMLElement | null) => el?.focus()
    const findSibling = (el: HTMLElement, dir: 'next' | 'prev') => {
      const sibling = dir === 'next' ? 'nextElementSibling' : 'previousElementSibling'
      const li = el.closest('li')
      return li?.[sibling]?.querySelector('[data-trigger]') as HTMLElement | null
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.getAttribute('data-trigger')) {
        switch (e.key) {
          case 'Home':
            e.preventDefault()
            focusMenuItem(mainTriggers[0])
            break
          case 'End':
            e.preventDefault()
            focusMenuItem(mainTriggers[mainTriggers.length - 1])
            break
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault()
            focusMenuItem(findSibling(target, 'next'))
            break
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault()
            focusMenuItem(findSibling(target, 'prev'))
            break
        }
      }
    })
  },
}
