export const krds_chkBox = {
  init(): void {
    const allCheckboxes = document.querySelectorAll('[data-chkbox]') as NodeListOf<HTMLInputElement>

    allCheckboxes.forEach((chk) => {
      chk.addEventListener('change', () => this.handleChange(chk))
    })

    // 전체 선택 감지
    const selectAllBoxes = document.querySelectorAll(
      '[data-chkbox-all]',
    ) as NodeListOf<HTMLInputElement>
    selectAllBoxes.forEach((master) => {
      master.addEventListener('change', () => this.handleSelectAll(master))
    })
  },

  handleChange(chk: HTMLInputElement): void {
    const wrapper = chk.closest('[data-chkbox-wrapper]') as HTMLElement | null
    wrapper?.classList.toggle('is-checked', chk.checked)

    const groupName = chk.getAttribute('data-chkbox-group')
    if (groupName) this.syncSelectAllState(groupName)
  },

  handleSelectAll(master: HTMLInputElement): void {
    const groupName = master.getAttribute('data-chkbox-group')
    if (!groupName) return

    const groupItems = document.querySelectorAll(
      `[data-chkbox][data-chkbox-group="${groupName}"]`,
    ) as NodeListOf<HTMLInputElement>

    groupItems.forEach((chk) => {
      chk.checked = master.checked
      this.handleChange(chk)
    })
  },

  syncSelectAllState(groupName: string): void {
    const master = document.querySelector(
      `[data-chkbox-all][data-chkbox-group="${groupName}"]`,
    ) as HTMLInputElement | null

    const groupItems = document.querySelectorAll(
      `[data-chkbox][data-chkbox-group="${groupName}"]`,
    ) as NodeListOf<HTMLInputElement>

    const allChecked = Array.from(groupItems).every((chk) => chk.checked)

    if (master) {
      master.checked = allChecked
      const wrapper = master.closest('[data-chkbox-wrapper]') as HTMLElement | null
      wrapper?.classList.toggle('is-checked', allChecked)
    }
  },
}
