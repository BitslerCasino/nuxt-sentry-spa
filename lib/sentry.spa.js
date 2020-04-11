import VueLib from 'vue'
import * as Sentry from '@sentry/browser'
import { <%= Object.keys(options.integrations).map(integration => integration).join(', ') %> } from '@sentry/integrations'
import { <%= Object.keys(options.integrationsEsm).map(integration => integration).join(', ') %> } from '@sentry/browser/esm/integrations'
import { Integrations as CoreIntegrations } from '@sentry/core'

const logger = require('consola').withScope('nuxt-spa:sentry')
export default function(ctx, inject) {
  const opts = Object.assign({}, <%= serialize(options.config) %>, {
    <% options.integrations = Object.assign(options.integrations, options.integrationsEsm, { 'CoreIntegrations.InboundFilters': {}, 'CoreIntegrations.FunctionToString': {} }) %>
    integrations: [
      <%= Object.keys(options.integrations).map(name => {
      const integration = options.integrations[name]
      if (name === 'Vue') {
        return `new ${name}({Vue: VueLib, ...${serialize(integration)}})`
      }
      return `new ${name}({${Object.keys(integration).map(option => typeof integration[option] === 'function' ?
        `${option}:${serializeFunction(integration[option])}` : `${option}:${serialize(integration[option])}`).join(',')}})`
    }).join(',\n      ') %>
    ]
  })

    <% if (options.initialize) { %>// Initialize sentry
  Sentry.init(opts) <% } %>

    // Inject Sentry to the context as $sentry
    inject('sentry', Sentry)
ctx.$sentry = Sentry
}
