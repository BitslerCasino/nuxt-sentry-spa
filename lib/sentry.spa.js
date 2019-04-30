import VueLib from 'vue'
import * as Sentry from '@sentry/browser'
import { <%= Object.keys(options.integrations).map(integration => integration).join(', ') %> } from '@sentry/integrations'
const logger = require('consola').withScope('nuxt-spa:sentry')
export default function(ctx, inject) {
  const opts = Object.assign({}, <%= JSON.stringify(options.config) %>, {
    integrations: [
      <%= Object.keys(options.integrations).map(name => {
        const integration = options.integrations[name]
        if (name === 'Vue') {
          return `new ${name}({Vue: VueLib, ...${JSON.stringify(integration)}})`
        }
        return `new ${name}({${Object.keys(integration).map(option => typeof integration[option] === 'function' ?
          `${option}:${serializeFunction(integration[option])}` : `${option}:${serialize(integration[option])}`).join(',')}})`
      }).join(',\n') %>
    ]
  })

  if (options.initialize) {
    Sentry.init(opts)
  } else {
    logger.info('Sentry not initialized')
  }

  // Inject Sentry to the context as $sentry
  inject('sentry', Sentry)
}
