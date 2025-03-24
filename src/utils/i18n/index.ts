import { inject } from 'vue'
import type { Composer } from 'vue-i18n'

export const useI18nInjection = () => {
  const i18n = inject<Composer>('i18n')
  const loadLocaleMessages = inject<(locale: string) => Promise<void>>('loadLocaleMessages')

  if (!i18n || !loadLocaleMessages) {
    throw new Error('i18n or loadLocaleMessages is not provided')
  }

  return { i18n, loadLocaleMessages }
}
