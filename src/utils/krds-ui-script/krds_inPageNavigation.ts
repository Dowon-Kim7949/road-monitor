export const krds_inPageNavigation = {
  sections: [] as HTMLElement[],
  navItems: [] as HTMLElement[],
  activeClass: 'active',
  offset: 100,

  init(): void {
    const navSelector = '[data-inpage-nav]'
    const sectionSelector = '[data-inpage-section]'

    this.navItems = Array.from(document.querySelectorAll(navSelector)) as HTMLElement[]
    this.sections = Array.from(document.querySelectorAll(sectionSelector)) as HTMLElement[]

    if (!this.navItems.length || !this.sections.length) return

    this.bindEvents()
    this.highlightSectionOnScroll()
  },

  bindEvents(): void {
    // 클릭 시 부드러운 스크롤 이동
    this.navItems.forEach((navItem) => {
      navItem.addEventListener('click', (e) => {
        e.preventDefault()
        const targetId = navItem.getAttribute('href')?.replace('#', '')
        const target = targetId ? document.getElementById(targetId) : null
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - this.offset
          window.scrollTo({ top, behavior: 'smooth' })
        }
      })
    })

    // 스크롤 이벤트로 현재 섹션 감지
    window.addEventListener('scroll', () => this.highlightSectionOnScroll())
  },

  highlightSectionOnScroll(): void {
    const scrollY = window.scrollY

    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i]
      if (scrollY + this.offset >= section.offsetTop) {
        this.setActiveNav(this.sections[i].id)
        break
      }
    }
  },

  setActiveNav(activeId: string): void {
    this.navItems.forEach((navItem) => {
      const href = navItem.getAttribute('href')?.replace('#', '')
      const isActive = href === activeId
      navItem.classList.toggle(this.activeClass, isActive)
      navItem.setAttribute('aria-current', isActive ? 'true' : 'false')
    })
  },
}
