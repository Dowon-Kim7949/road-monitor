export type WinSize = 'pc' | 'mob'

export const windowSize = {
  winSize: null as WinSize | null,
  breakPoint: 1024,

  setWinSize(): void {
    this.winSize = window.innerWidth >= this.breakPoint ? 'pc' : 'mob'
  },

  getWinSize(): WinSize | null {
    return this.winSize
  },
}
