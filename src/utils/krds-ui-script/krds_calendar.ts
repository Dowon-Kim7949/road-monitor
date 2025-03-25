export const krds_calendar = {
  init(): void {
    const calendars = document.querySelectorAll('[data-krds-calendar]') as NodeListOf<HTMLElement>
    calendars.forEach((calendar) => this.setupCalendar(calendar))
  },

  setupCalendar(calendar: HTMLElement): void {
    const prevBtn = calendar.querySelector('[data-calendar-prev]') as HTMLButtonElement | null
    const nextBtn = calendar.querySelector('[data-calendar-next]') as HTMLButtonElement | null
    const days = calendar.querySelectorAll('[data-calendar-day]') as NodeListOf<HTMLButtonElement>

    prevBtn?.addEventListener('click', () => this.navigate(calendar, 'prev'))
    nextBtn?.addEventListener('click', () => this.navigate(calendar, 'next'))

    days.forEach((day) => {
      day.setAttribute('role', 'button')
      day.setAttribute('tabindex', '-1')
      day.addEventListener('click', () => this.selectDate(calendar, day))
      day.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeydown(e, calendar))
    })

    // 초기 포커스 설정
    const selected = calendar.querySelector('[aria-selected="true"]') as HTMLElement | null
    selected?.setAttribute('tabindex', '0')
  },

  navigate(calendar: HTMLElement, direction: 'prev' | 'next'): void {
    // 실제 구현에서는 달력을 리렌더링 하거나, 월/연도 이동 처리
    const label = calendar.querySelector('[data-calendar-label]')
    if (label) {
      console.log(`Navigate ${direction} from`, label.textContent)
      // → 여기서 AJAX 호출이나 렌더링 업데이트가 발생
    }
  },

  selectDate(calendar: HTMLElement, dayButton: HTMLButtonElement): void {
    const prevSelected = calendar.querySelector(
      '[aria-selected="true"]',
    ) as HTMLButtonElement | null
    prevSelected?.setAttribute('aria-selected', 'false')
    prevSelected?.setAttribute('tabindex', '-1')

    dayButton.setAttribute('aria-selected', 'true')
    dayButton.setAttribute('tabindex', '0')
    dayButton.focus()
  },

  handleKeydown(event: KeyboardEvent, calendar: HTMLElement): void {
    const key = event.key
    const current = event.currentTarget as HTMLButtonElement

    const focusableDays = Array.from(
      calendar.querySelectorAll('[data-calendar-day]'),
    ) as HTMLButtonElement[]
    const index = focusableDays.indexOf(current)

    let newIndex = index
    switch (key) {
      case 'ArrowLeft':
        newIndex = index - 1
        break
      case 'ArrowRight':
        newIndex = index + 1
        break
      case 'ArrowUp':
        newIndex = index - 7
        break
      case 'ArrowDown':
        newIndex = index + 7
        break
      default:
        return
    }

    event.preventDefault()
    const next = focusableDays[newIndex]
    if (next) {
      current.setAttribute('tabindex', '-1')
      next.setAttribute('tabindex', '0')
      next.focus()
    }
  },
}
