export const krds_adjustContentScale = {
  targetSelector: '[data-scale-target]',
  baseWidth: 1920,
  baseHeight: 1080,
  maxScale: 1,
  minScale: 0.5,

  init(): void {
    const target = document.querySelector(this.targetSelector) as HTMLElement | null
    if (!target) return

    this.applyScale(target)
    window.addEventListener('resize', () => this.applyScale(target))
  },

  applyScale(target: HTMLElement): void {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const scaleX = viewportWidth / this.baseWidth
    const scaleY = viewportHeight / this.baseHeight

    // 너비 기준 비율로 조정 (높이 기준으로 바꾸고 싶으면 scaleY 사용)
    const scale = Math.max(this.minScale, Math.min(this.maxScale, Math.min(scaleX, scaleY)))

    target.style.transform = `scale(${scale})`
    target.style.transformOrigin = 'top left'

    // 필요시 가운데 정렬 (옵션)
    const offsetX = (viewportWidth - this.baseWidth * scale) / 2
    const offsetY = (viewportHeight - this.baseHeight * scale) / 2

    target.style.position = 'absolute'
    target.style.left = `${offsetX}px`
    target.style.top = `${offsetY}px`
  },
}
