export const scrollManager = {
  _scrollY: 0,
  _scrollH: 0,
  _lastScrollY: 0,

  updateScrollValues(): void {
    this._scrollY = window.scrollY
    this._scrollH = document.body.scrollHeight
  },

  handleScrollDirection(): void {
    const $wrap = document.querySelector('#wrap') as HTMLElement | null
    const $container = document.querySelector('#container') as HTMLElement | null

    if (!$wrap || !$container) return

    const containerOffsetTop = $container.offsetTop
    const scrollY = window.scrollY
    const scrollDown = scrollY > this._lastScrollY
    const scrollUp = scrollY < this._lastScrollY

    if (scrollY > containerOffsetTop + 50 && scrollDown) {
      $wrap.classList.add('scroll-down')
      $wrap.classList.remove('scroll-up')
    } else if (scrollY > containerOffsetTop + 50 && scrollUp) {
      $wrap.classList.add('scroll-up')
      $wrap.classList.remove('scroll-down')
    } else {
      $wrap.classList.remove('scroll-down', 'scroll-up')
    }

    this._lastScrollY = scrollY
  },

  getScrollY(): number {
    return this._scrollY
  },

  getScrollH(): number {
    return this._scrollH
  },
}
