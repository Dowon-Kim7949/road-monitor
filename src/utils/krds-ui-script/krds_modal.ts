import { common } from './krds_common'

export const krds_modal = {
  init(): void {
    const modalTriggers = document.querySelectorAll(
      '[data-modal-trigger]',
    ) as NodeListOf<HTMLElement>
    const modalCloses = document.querySelectorAll('[data-modal-close]') as NodeListOf<HTMLElement>

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-modal-trigger')
        const modal = modalId ? document.getElementById(modalId) : null
        if (modal) this.open(modal, trigger)
      })
    })

    modalCloses.forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.krds-modal') as HTMLElement | null
        if (modal) this.close(modal)
      })
    })
  },

  open(modal: HTMLElement, trigger?: HTMLElement): void {
    modal.style.display = 'block'
    document.body.classList.add('is-modal-open')

    setTimeout(() => {
      modal.classList.add('is-open')
      modal.setAttribute('aria-hidden', 'false')

      const content = modal.querySelector<HTMLElement>('.modal-content')
      content?.focus()

      const header = document.querySelector('#krds-header .header-in')
      const container = document.getElementById('container')
      const footer = document.getElementById('footer')

      header?.setAttribute('inert', '')
      container?.setAttribute('inert', '')
      footer?.setAttribute('inert', '')

      if (content) {
        common.focusTrap(content)
      }

      if (trigger) {
        modal.setAttribute('data-modal-opener-id', trigger.id || '')
      }
    }, 10)
  },

  close(modal: HTMLElement): void {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('is-modal-open')

    const openerId = modal.getAttribute('data-modal-opener-id')
    const opener = openerId ? document.getElementById(openerId) : null

    const header = document.querySelector('#krds-header .header-in')
    const container = document.getElementById('container')
    const footer = document.getElementById('footer')

    header?.removeAttribute('inert')
    container?.removeAttribute('inert')
    footer?.removeAttribute('inert')

    modal.addEventListener(
      'transitionend',
      () => {
        modal.style.display = 'none'
        if (opener) opener.focus()
      },
      { once: true },
    )
  },
}
