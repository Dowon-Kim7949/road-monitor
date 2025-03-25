export const krds_toggleSwitch = {
  init(): void {
    const switches = document.querySelectorAll('[data-toggle-switch]') as NodeListOf<HTMLElement>

    switches.forEach((switchEl) => {
      const controlId = switchEl.getAttribute('aria-controls')
      const controlledEl = controlId ? document.getElementById(controlId) : null

      // 초기 상태 설정
      const isChecked = switchEl.getAttribute('aria-checked') === 'true'
      this.setState(switchEl, controlledEl, isChecked)

      // 이벤트 연결
      switchEl.addEventListener('click', () => {
        const currentState = switchEl.getAttribute('aria-checked') === 'true'
        this.setState(switchEl, controlledEl, !currentState)
      })
    })
  },

  setState(switchEl: HTMLElement, controlledEl: HTMLElement | null, isOn: boolean): void {
    switchEl.setAttribute('aria-checked', String(isOn))
    switchEl.classList.toggle('is-on', isOn)

    if (controlledEl) {
      controlledEl.classList.toggle('is-hidden', !isOn)
      controlledEl.setAttribute('aria-hidden', String(!isOn))
    }
  },
}
