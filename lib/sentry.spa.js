import VueLib from 'vue'
<% if (Array.isArray(options.config.dsn) && options.config.dsn.length) {  %>
<% for (var i = 0; i < options.config.dsn.length; i++) { %>
import * as <%= 'Sentry_' + i %> from '@sentry/browser'
      <% } %>
<% } else { %>
import * as Sentry from '@sentry/browser';
<% } %>
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
      <% if (Array.isArray(options.config.dsn)) { %>
        <% for (var i = 0; i < options.config.dsn.length; i++) { %>
      opts.dsn = <%=serialize(options.config.dsn[i]) %>
        Sentry_<%= i %>.init(opts)
      inject(`sentry_${<%= i %>} `, Sentry_<%=i %>)
      ctx.$sentry_<%=i %> = Sentry_<%=i %>
        <% } %>
  <% } else { %>
      Sentry.init(opts)
      inject('sentry', Sentry)
      ctx.$sentry = Sentry
  <% } %>
  <% } %>

  // Inject Sentry to the context as $sentry

}
