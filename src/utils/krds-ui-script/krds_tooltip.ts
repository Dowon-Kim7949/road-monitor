export const krds_tooltip = {
  init(): void {
    const tooltipTriggers = document.querySelectorAll(
      '[data-tooltip-trigger]',
    ) as NodeListOf<HTMLElement>

    tooltipTriggers.forEach((trigger) => {
      const targetId = trigger.getAttribute('data-tooltip-trigger')
      if (!targetId) return
      const tooltip = targetId ? document.getElementById(targetId) : null
      if (!tooltip) return

      // 접근성 설정
      trigger.setAttribute('aria-controls', targetId)
      trigger.setAttribute('aria-expanded', 'false')
      tooltip.setAttribute('role', 'tooltip')

      // 토글 이벤트
      trigger.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation()
        const isActive = tooltip.classList.contains('is-open')
        this.resetAll()

        if (!isActive) {
          tooltip.classList.add('is-open')
          trigger.setAttribute('aria-expanded', 'true')
        }
      })
    })

    // 바깥 클릭 시 툴팁 닫기
    document.addEventListener('click', () => this.resetAll())
  },

  resetAll(): void {
    const tooltips = document.querySelectorAll('.krds-tooltip.is-open') as NodeListOf<HTMLElement>
    const triggers = document.querySelectorAll('[data-tooltip-trigger]') as NodeListOf<HTMLElement>

    tooltips.forEach((tooltip) => {
      tooltip.classList.remove('is-open')
    })

    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false')
    })
  },
}
