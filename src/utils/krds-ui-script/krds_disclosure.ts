export const krds_disclosure = {
  init(): void {
    const triggers = document.querySelectorAll(
      '[data-disclosure-trigger]',
    ) as NodeListOf<HTMLElement>

    triggers.forEach((trigger, index) => {
      const targetId = trigger.getAttribute('aria-controls')
      const target = targetId ? document.getElementById(targetId) : null
      const group = trigger.closest('[data-disclosure-group]') as HTMLElement | null
      const isMulti = group?.dataset.disclosureGroup === 'multi'

      if (!target) return

      // 접근성 속성 설정
      trigger.setAttribute('role', 'button')
      trigger.setAttribute('tabindex', '0')
      trigger.setAttribute('aria-expanded', 'false')
      target.setAttribute('hidden', 'true')

      // 클릭 이벤트
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true'
        if (isMulti) {
          this.toggle(trigger, target, !expanded)
        } else {
          this.closeAllInGroup(group)
          this.toggle(trigger, target, true)
        }
      })
    })
  },

  toggle(trigger: HTMLElement, target: HTMLElement, expand: boolean): void {
    trigger.setAttribute('aria-expanded', String(expand))
    target.hidden = !expand
  },

  closeAllInGroup(group: HTMLElement | null): void {
    if (!group) return
    const triggers = group.querySelectorAll('[data-disclosure-trigger]') as NodeListOf<HTMLElement>

    triggers.forEach((trigger) => {
      const targetId = trigger.getAttribute('aria-controls')
      const target = targetId ? document.getElementById(targetId) : null
      if (target) this.toggle(trigger, target, false)
    })
  },
}
