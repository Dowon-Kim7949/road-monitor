export const krds_dropEvent = {
  init(): void {
    const triggers = document.querySelectorAll('[data-drop-trigger]') as NodeListOf<HTMLElement>

    triggers.forEach((trigger) => {
      const dropId = trigger.getAttribute('aria-controls')
      const dropTarget = dropId ? document.getElementById(dropId) : null
      if (!dropTarget) return

      // 초기 aria 설정
      trigger.setAttribute('aria-expanded', 'false')
      dropTarget.setAttribute('aria-hidden', 'true')

      // 클릭 이벤트
      trigger.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation()
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
        this.closeAll()
        if (!isExpanded) {
          this.open(trigger, dropTarget)
        }
      })
    })

    // 바깥 클릭 시 닫기
    document.addEventListener('click', () => this.closeAll())
  },

  open(trigger: HTMLElement, target: HTMLElement): void {
    trigger.setAttribute('aria-expanded', 'true')
    trigger.classList.add('active')

    target.classList.add('is-open')
    target.setAttribute('aria-hidden', 'false')
  },

  close(trigger: HTMLElement, target: HTMLElement): void {
    trigger.setAttribute('aria-expanded', 'false')
    trigger.classList.remove('active')

    target.classList.remove('is-open')
    target.setAttribute('aria-hidden', 'true')
  },

  closeAll(): void {
    const allTriggers = document.querySelectorAll(
      '[data-drop-trigger][aria-expanded="true"]',
    ) as NodeListOf<HTMLElement>
    allTriggers.forEach((trigger) => {
      const dropId = trigger.getAttribute('aria-controls')
      const target = dropId ? document.getElementById(dropId) : null
      if (target) this.close(trigger, target)
    })
  },
}
