export const krds_accordion = {
  accordionButtons: null as NodeListOf<HTMLButtonElement> | null,
  accordionHandlers: new Map<HTMLButtonElement, () => void>(),

  init(): void {
    this.accordionButtons = document.querySelectorAll('.btn-accordion')
    if (!this.accordionButtons.length) return

    this.setupAccordions()
  },

  setupAccordions(): void {
    this.accordionButtons?.forEach((button, idx) => {
      const accordionContainer = button.closest('.krds-accordion') as HTMLElement | null
      const currentItem = button.closest('.accordion-item') as HTMLElement | null
      const accordionContent = currentItem?.querySelector(
        '.accordion-collapse',
      ) as HTMLElement | null
      const accordionItems = accordionContainer?.querySelectorAll(
        '.accordion-item',
      ) as NodeListOf<HTMLElement>
      const accordionType = accordionContainer?.dataset.type || 'singleOpen'
      const isOpen = accordionContainer?.classList.contains('is-open')

      if (!accordionContainer || !currentItem || !accordionContent || !accordionItems) return

      // 접근성 속성 세팅
      this.setupAriaAttributes(button, accordionContent, idx)

      // 초기 오픈 상태 처리
      if (isOpen || currentItem.classList.contains('active')) {
        button.setAttribute('aria-expanded', 'true')
        button.classList.add('active')
        currentItem.classList.add('active')
      }

      // 이벤트 핸들러 바인딩 및 중복 제거
      let handler = this.accordionHandlers.get(button)
      if (!handler) {
        handler = this.accordionToggle.bind(
          this,
          button,
          accordionItems,
          accordionType,
          currentItem,
        )
        this.accordionHandlers.set(button, handler)
      }

      button.removeEventListener('click', handler)
      button.addEventListener('click', handler)
    })
  },

  setupAriaAttributes(button: HTMLButtonElement, content: HTMLElement, idx: number): void {
    const uniqueId = `${idx}-${Math.random().toString(36).substring(2, 9)}`
    button.setAttribute('aria-expanded', 'false')
    button.setAttribute('id', `accordionHeader-id-${uniqueId}`)
    button.setAttribute('aria-controls', `accordionCollapse-id-${uniqueId}`)

    content.setAttribute('role', 'region')
    content.setAttribute('id', `accordionCollapse-id-${uniqueId}`)
    content.setAttribute('aria-labelledby', `accordionHeader-id-${uniqueId}`)
  },

  accordionToggle(
    button: HTMLButtonElement,
    accordionItems: NodeListOf<HTMLElement>,
    accordionType: string,
    currentItem: HTMLElement,
  ): void {
    const isExpanded = button.getAttribute('aria-expanded') === 'true'

    // singleOpen 타입이면 다른 항목 닫기
    if (accordionType !== 'multiOpen' && !currentItem.classList.contains('active')) {
      accordionItems.forEach((item) => {
        const otherButton = item.querySelector('.btn-accordion') as HTMLButtonElement
        otherButton.setAttribute('aria-expanded', 'false')
        otherButton.classList.remove('active')
        item.classList.remove('active')
      })
    }

    // 현재 항목 토글
    button.setAttribute('aria-expanded', (!isExpanded).toString())
    button.classList.toggle('active', !isExpanded)
    currentItem.classList.toggle('active', !isExpanded)
  },
}
