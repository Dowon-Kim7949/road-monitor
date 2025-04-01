import '@/assets/style/main.css'
import '@/assets/style/openlayers-reset.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n, type Composer } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)

type Locale = 'en' | 'ko'
const messages: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('@/utils/i18n/locales/en.json'),
  ko: () => import('@/utils/i18n/locales/ko.json'),
}

const loadLocaleMessages = async (locale: Locale) => {
  if (!messages[locale]) {
    return
  }

  const loadedMessages = await messages[locale]()
  i18n.global.setLocaleMessage(locale, loadedMessages.default)
  i18n.global.locale.value = locale
}

const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'ko',
  messages: {},
})

await loadLocaleMessages('ko')

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueApexCharts)

app.provide<Composer>('i18n', i18n.global)
app.provide('loadLocaleMessages', loadLocaleMessages)

app.mount('#app')
