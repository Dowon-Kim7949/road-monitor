export const krds_fileUpload = {
  init(): void {
    const fileInputs = document.querySelectorAll(
      '[data-file-upload]',
    ) as NodeListOf<HTMLInputElement>

    fileInputs.forEach((input) => {
      const wrapper = input.closest('[data-file-wrapper]') as HTMLElement | null
      const fileNameDisplay = wrapper?.querySelector('[data-file-name]') as HTMLElement | null
      const deleteBtn = wrapper?.querySelector('[data-file-delete]') as HTMLElement | null

      // 파일 선택 이벤트
      input.addEventListener('change', () => {
        const file = input.files?.[0]
        if (file && fileNameDisplay) {
          fileNameDisplay.textContent = file.name
          wrapper?.classList.add('has-file')
        }
      })

      // 삭제 버튼 이벤트
      deleteBtn?.addEventListener('click', () => {
        input.value = ''
        if (fileNameDisplay) fileNameDisplay.textContent = ''
        wrapper?.classList.remove('has-file')
      })
    })
  },
}
