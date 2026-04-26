import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { createVuetify } from 'vuetify'


export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'gvsuTheme',
    themes: {
      gvsuTheme: {
        dark: false,
        colors: {
          primary: '#0032A0',
          secondary: '#0ECBF0',
          background: '#F7FAFF',
          surface: '#FFFFFF',
          error: '#9B1C1C',
          warning: '#BA6F4C',
          info: '#0ECBF0',
          success: '#3DD1CC',
        },
      },
    },
  },
})
