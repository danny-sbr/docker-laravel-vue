import './styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  locale: {
    accept: '是',
    reject: '否',
    choose: '選擇',
    upload: '上傳',
    cancel: '取消',
    dayNames: [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ],
    dayNamesShort: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
    monthNamesShort: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
    today: '今天',
    weekHeader: '週',
    firstDayOfWeek: 0,
    dateFormat: 'yy/mm/dd',
  },
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: false,
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities',
      },
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.mount('#app')
