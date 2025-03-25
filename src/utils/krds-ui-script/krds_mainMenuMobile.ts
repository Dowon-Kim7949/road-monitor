import { common } from './krds_common'
import { windowSize } from './krds_windowSize'

export const krds_mainMenuMobile = {
  init(): void {
    const mobileGnb = document.querySelector(
      '.krds-main-menu-mobile:not(.sample)',
    ) as HTMLElement | null
    if (!mobileGnb) return

    if (mobileGnb.classList.contains('is-open')) {
      this.openMainMenu(mobileGnb)
    } else {
      mobileGnb.style.display = 'none'
    }

    mobileGnb.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.gnb-wrap')) {
        const gnbWrap = mobileGnb.querySelector('.gnb-wrap') as HTMLElement | null
        gnbWrap?.focus()
      }
    })

    this.setupAriaAttributes(mobileGnb)
    this.attachEvents(mobileGnb)
  },

  setupAriaAttributes(mobileGnb: HTMLElement): void {
    const tabList = mobileGnb.querySelector('.menu-wrap')
    if (!tabList) return

    const ul = tabList.querySelector('ul')
    ul?.setAttribute('role', 'tablist')

    const lis = tabList.querySelectorAll('li')
    lis.forEach((li) => li.setAttribute('role', 'none'))

    const tabs = mobileGnb.querySelectorAll(
      '.menu-wrap .gnb-main-trigger',
    ) as NodeListOf<HTMLElement>
    tabs.forEach((item, idx) => {
      item.setAttribute('role', 'tab')
      item.setAttribute('aria-selected', 'false')
      item.setAttribute('aria-controls', item.getAttribute('href')?.substring(1) || '')
      item.setAttribute('id', `tab-${idx}`)

      item.addEventListener('click', (event) => {
        event.preventDefault()
        const id = item.getAttribute('aria-controls')
        if (!id) return
        const top = document.getElementById(id)?.offsetTop || 0
        const gnbBody = document.querySelector('.gnb-body')
        gnbBody?.scrollTo({ top, left: 0, behavior: 'smooth' })
      })
    })

    const tabPanels = mobileGnb.querySelectorAll('.submenu-wrap .gnb-sub-list')
    tabPanels.forEach((item, idx) => {
      item.setAttribute('role', 'tabpanel')
      item.setAttribute('aria-labelledby', `tab-${idx}`)
    })
  },

  attachEvents(mobileGnb: HTMLElement): void {
    const id = mobileGnb.getAttribute('id')
    const openGnb = document.querySelector(`[aria-controls="${id}"]`) as HTMLElement | null
    const closeGnb = mobileGnb.querySelector('#close-nav') as HTMLElement | null

    openGnb?.addEventListener('click', () => this.openMainMenu(mobileGnb))
    closeGnb?.addEventListener('click', () => this.closeMainMenu(mobileGnb))

    this.setupAnchorScroll(mobileGnb)
    this.setupAnchorLinks(mobileGnb)

    window.addEventListener('resize', () => {
      const isPC = windowSize.getWinSize() === 'pc'
      if (isPC) this.closeMainMenu(mobileGnb)
    })
  },

  openMainMenu(mobileGnb: HTMLElement): void {
    const navContainer = mobileGnb.querySelector('.gnb-wrap') as HTMLElement | null
    if (!navContainer) return

    mobileGnb.style.display = 'block'
    navContainer.setAttribute('tabindex', '0')

    const activeTrigger = document.querySelector('.gnb-main-trigger.active') as HTMLElement | null
    if (activeTrigger) {
      const id = activeTrigger.getAttribute('aria-controls') || ''
      const top = document.getElementById(id)?.offsetTop || 0
      const gnbBody = document.querySelector('.gnb-body') as HTMLElement | null
      if (gnbBody) {
        gnbBody.style.scrollBehavior = 'auto'
        gnbBody.scrollTop = top
      }
    }

    setTimeout(() => {
      mobileGnb.classList.add('is-backdrop', 'is-open')
      document.body.classList.add('is-gnb-mobile')
    }, 100)

    mobileGnb.addEventListener('transitionend', function onEnd() {
      navContainer?.focus()
      mobileGnb.removeEventListener('transitionend', onEnd)

      document.querySelector('#krds-header .header-in')?.setAttribute('inert', '')
      document.getElementById('container')?.setAttribute('inert', '')
      document.getElementById('footer')?.setAttribute('inert', '')

      common.focusTrap(mobileGnb)
    })
  },

  closeMainMenu(mobileGnb: HTMLElement): void {
    const id = mobileGnb.getAttribute('id')
    const openGnb = document.querySelector(`[aria-controls="${id}"]`) as HTMLElement | null

    mobileGnb.classList.remove('is-backdrop', 'is-open')

    document.querySelector('#krds-header .header-in')?.removeAttribute('inert')
    document.getElementById('container')?.removeAttribute('inert')
    document.getElementById('footer')?.removeAttribute('inert')

    mobileGnb.addEventListener('transitionend', function onEnd() {
      openGnb?.focus()
      mobileGnb.removeEventListener('transitionend', onEnd)
    })

    setTimeout(() => {
      mobileGnb.style.display = 'none'
      document.body.classList.remove('is-gnb-mobile')
    }, 400)
  },

  setupAnchorScroll(mobileGnb: HTMLElement): void {
    const gnbBody = mobileGnb.querySelector('.gnb-body') as HTMLElement | null
    const navContainer = mobileGnb.querySelector('.gnb-wrap') as HTMLElement | null
    const navItems = mobileGnb.querySelectorAll('.submenu-wrap .gnb-sub-list')
    const headerTabArea = mobileGnb.querySelector('.gnb-tab-nav') as HTMLElement | null

    if (!gnbBody || !navContainer) return

    gnbBody.addEventListener('scroll', () => {
      const scrollTop = gnbBody.scrollTop
      const scrollHeight = gnbBody.scrollHeight
      const bodyHeight = gnbBody.clientHeight

      navItems.forEach((item) => {
        const element = item as HTMLElement
        const id = element.getAttribute('id')
        if (!id) return

        const offset = element.offsetTop
        const menuLink = mobileGnb.querySelector(`[href="#${id}"]`) as HTMLElement | null

        if (scrollTop >= offset || scrollTop + bodyHeight >= scrollHeight) {
          this.resetAnchorMenu()
          menuLink?.classList.add('active')
          menuLink?.setAttribute('aria-selected', 'true')
        }
      })

      this.handleTopScroll(headerTabArea, navContainer, gnbBody)
    })
  },

  handleTopScroll(
    headerTabArea: HTMLElement | null,
    navContainer: HTMLElement,
    gnbBody: HTMLElement,
  ): void {
    let lastBodyScrollY = 0
    if (!headerTabArea) return

    gnbBody.addEventListener('scroll', (event) => {
      const scrollY = (event.target as HTMLElement).scrollTop
      if (scrollY > 0) {
        headerTabArea.style.height = `${headerTabArea.scrollHeight}px`
        headerTabArea.style.transition = 'ease-out .4s'
        navContainer.classList.add('is-active')
      } else if (scrollY < 50 && scrollY < lastBodyScrollY) {
        headerTabArea.style.height = ''
        headerTabArea.style.transition = 'ease-out .4s .2s'
        setTimeout(() => navContainer.classList.remove('is-active'), 600)
      }
      lastBodyScrollY = scrollY
    })
  },

  setupAnchorLinks(mobileGnb: HTMLElement): void {
    const menuItems = mobileGnb.querySelectorAll('.menu-wrap .gnb-main-trigger')
    const navItems = mobileGnb.querySelectorAll('.submenu-wrap .gnb-sub-list')

    if (!mobileGnb.querySelector('.gnb-main-trigger.active') && menuItems.length > 0) {
      menuItems[0].classList.add('active')
      menuItems[0].setAttribute('aria-selected', 'true')
    }

    navItems.forEach((item) => {
      const depth3Items = item.querySelectorAll('.has-depth3')
      depth3Items.forEach((btn) => {
        if (btn.classList.contains('active')) {
          btn.classList.add('active')
          btn.setAttribute('aria-expanded', 'true')
          btn.nextElementSibling?.classList.add('is-open')
        } else {
          btn.setAttribute('aria-expanded', 'false')
        }
        btn.addEventListener('click', (e) => this.handleDepth3Click(e))
      })

      const depth4Items = item.querySelectorAll('.has-depth4')
      depth4Items.forEach((btn) => {
        btn.addEventListener('click', (e) => this.handleDepth4Click(e))
      })
    })
  },

  handleDepth3Click(event: Event): void {
    const target = event.currentTarget as HTMLElement
    const isActive = target.classList.contains('active')

    const reset = () => {
      document.querySelectorAll('.has-depth3').forEach((el) => {
        el.classList.remove('active')
        el.setAttribute('aria-expanded', 'false')
        el.nextElementSibling?.classList.remove('is-open')
      })
    }

    if (!isActive) {
      reset()
      target.classList.add('active')
      target.setAttribute('aria-expanded', 'true')
      target.nextElementSibling?.classList.add('is-open')
    } else {
      reset()
    }
  },

  handleDepth4Click(event: Event): void {
    const btn = event.currentTarget as HTMLElement
    const target = btn.nextElementSibling as HTMLElement
    const prev = target.querySelector('.trigger-prev') as HTMLElement
    const close = target.querySelector('.trigger-close') as HTMLElement

    target.style.display = 'block'
    setTimeout(() => target.classList.add('is-open'), 0)
    prev?.focus()

    const closeFn = () => {
      target.classList.remove('is-open')
      btn.focus()
      setTimeout(() => (target.style.display = ''), 400)
    }

    prev?.addEventListener('click', closeFn)
    close?.addEventListener('click', closeFn)

    common.focusTrap(target)
  },

  resetAnchorMenu(): void {
    const items = document.querySelectorAll('.krds-main-menu-mobile .gnb-main-trigger')
    items.forEach((item) => {
      item.classList.remove('active')
      item.setAttribute('aria-selected', 'false')
    })
  },
}
