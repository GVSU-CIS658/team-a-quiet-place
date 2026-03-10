import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'hiddenGemsTheme',
    themes: {
      hiddenGemsTheme: {
        dark: false,
        colors: {
          primary: '#2F5D9F',
          secondary: '#6E8DB7',
          background: '#F5F8FC',
          surface: '#FFFFFF',
        },
      },
    },
  },
})