export const krds_infoList = {
  init(): void {
    const triggers = document.querySelectorAll('[data-info-toggle]') as NodeListOf<HTMLElement>

    triggers.forEach((trigger) => {
      const targetId = trigger.getAttribute('aria-controls')
      const target = targetId ? document.getElementById(targetId) : null
      if (!target) return

      // 초기 상태 설정
      const expanded = trigger.getAttribute('aria-expanded') === 'true'
      this.setState(trigger, target, expanded)

      // 클릭 이벤트 바인딩
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
        this.setState(trigger, target, !isExpanded)
      })
    })
  },

  setState(trigger: HTMLElement, target: HTMLElement, expanded: boolean): void {
    trigger.setAttribute('aria-expanded', String(expanded))
    target.setAttribute('aria-hidden', String(!expanded))

    trigger.classList.toggle('active', expanded)
    target.classList.toggle('is-open', expanded)
  },
}
