export const krds_sideNavigation = {
  init(): void {
    this.setupSideNavLists()
    this.setupToggleEvents()
    this.setupPopupEvents()
  },

  setupSideNavLists(): void {
    const navLists = document.querySelectorAll(
      '.krds-side-navigation .lnb-list',
    ) as NodeListOf<HTMLElement>
    navLists.forEach((navList) => {
      const navItems = navList.querySelectorAll('li')
      navItems.forEach((navItem) => this.setupNavItem(navItem))
    })
  },

  setupNavItem(navItem: Element): void {
    const navButton = navItem.querySelector('.lnb-btn') as HTMLElement | null
    if (!navButton || !navButton.className.includes('lnb-toggle')) return

    const uniqueIdx = `lnbmenu-${Math.random().toString(36).substring(2, 9)}`
    const navSubmenu = navButton.nextElementSibling as HTMLElement | null

    navButton.setAttribute('aria-controls', uniqueIdx)
    navButton.setAttribute(
      'aria-expanded',
      navButton.classList.contains('active') ? 'true' : 'false',
    )

    if (navButton.classList.contains('lnb-toggle-popup')) {
      navButton.setAttribute('aria-haspopup', 'true')
    }

    if (navSubmenu && navSubmenu.className.includes('lnb-submenu')) {
      const submenuList = navSubmenu.classList.contains('lnb-submenu-lv2')
        ? navSubmenu
        : (navSubmenu.querySelector(':scope > ul') as HTMLElement | null)

      submenuList?.setAttribute('id', uniqueIdx)
    }
  },

  setupToggleEvents(): void {
    const toggleButtons = document.querySelectorAll(
      '.krds-side-navigation .lnb-list:not(.exception-case) .lnb-toggle',
    ) as NodeListOf<HTMLElement>

    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const expand = button.getAttribute('aria-expanded') !== 'true'
        this.setActiveNav(button, expand)
      })
    })
  },

  setActiveNav(toggleButton: HTMLElement, expand: boolean): void {
    const parentListItem = toggleButton.closest('li')
    if (!parentListItem) return

    toggleButton.setAttribute('aria-expanded', expand.toString())
    parentListItem.classList.toggle('active', expand)
  },

  setupPopupEvents(): void {
    let lastClickedButton: HTMLElement | null = null

    const popupToggleButtons = document.querySelectorAll(
      '.lnb-toggle-popup',
    ) as NodeListOf<HTMLElement>
    const popupSubmenus = document.querySelectorAll('.lnb-submenu-lv2') as NodeListOf<HTMLElement>

    popupToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const popupSubmenu = button.nextElementSibling as HTMLElement | null
        if (!popupSubmenu?.classList.contains('lnb-submenu-lv2')) return

        popupSubmenu.classList.add('active')
        button.setAttribute('aria-expanded', 'true')

        popupSubmenu.addEventListener(
          'transitionend',
          () => {
            const title = popupSubmenu.querySelector('.lnb-btn-tit') as HTMLElement | null
            title?.focus()
          },
          { once: true },
        )

        lastClickedButton = button
      })
    })

    popupSubmenus.forEach((submenu) => {
      submenu.addEventListener('focusout', (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget as Node | null
        if (!relatedTarget || !submenu.contains(relatedTarget)) {
          submenu.classList.remove('active')
          if (lastClickedButton) {
            lastClickedButton.setAttribute('aria-expanded', 'false')
            submenu.addEventListener('transitionend', () => lastClickedButton?.focus(), {
              once: true,
            })
          }
        }
      })

      const titleButton = submenu.querySelector('.lnb-btn-tit') as HTMLElement | null
      titleButton?.addEventListener('click', () => {
        lastClickedButton?.focus()
      })
    })
  },

  // 아래 함수는 필요 시 사용할 수 있음
  toggleMenu(toggleButton: HTMLElement, expand: boolean): void {
    const parentListItem = toggleButton.closest('li')
    toggleButton.setAttribute('aria-expanded', expand.toString())
    toggleButton.classList.toggle('active', expand)
    parentListItem?.classList.toggle('active', expand)
  },

  closeSiblingMenus(toggleButton: HTMLElement): void {
    const parentListItem = toggleButton.closest('li')
    if (!parentListItem || !parentListItem.parentElement) return

    const siblingButtons = parentListItem.parentElement.querySelectorAll(
      ':scope > li > .lnb-toggle',
    ) as NodeListOf<HTMLElement>

    siblingButtons.forEach((siblingButton) => {
      if (siblingButton !== toggleButton) {
        this.toggleMenu(siblingButton, false)
      }
    })
  },

  setActiveCurrentPage(): void {
    const currentPage = window.location.pathname.split('/').pop()?.replace('.html', '') ?? ''
    const lnbLinks = document.querySelectorAll(
      '.krds-side-navigation .lnb-link',
    ) as NodeListOf<HTMLAnchorElement>

    lnbLinks.forEach((link) => {
      const linkPage = link.getAttribute('href')?.split('/').pop()?.replace('.html', '') ?? ''
      if (linkPage === currentPage) {
        const item = link.closest('.lnb-item') as HTMLElement | null
        const li = link.closest('li') as HTMLElement | null
        const toggle = item?.querySelector('.lnb-toggle') as HTMLElement | null

        item?.classList.add('active')
        toggle?.classList.add('active')
        toggle?.setAttribute('aria-expanded', 'true')
        li?.classList.add('active')
        link.setAttribute('aria-current', 'page')
      }
    })
  },
}
