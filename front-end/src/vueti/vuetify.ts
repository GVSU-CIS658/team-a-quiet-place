import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { createVuetify } from 'vuetify'


export default createVuetify({ components, directives})

// export default createVuetify({
//   theme: {
//     defaultTheme: 'hiddenGemsTheme',
//     themes: {
//       hiddenGemsTheme: {
//         dark: false,
//         colors: {
//           primary: '#2F5D9F',
//           secondary: '#6E8DB7',
//           background: '#F5F8FC',
//           surface: '#FFFFFF',
//         },
//       },
//     },
//   },
// })