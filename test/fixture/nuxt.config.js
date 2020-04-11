import SentrySpa from '../..'

export default {
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [
    SentrySpa
  ],
  sentry: {
    dsn: ['https://fe8b7df6ea7042f69d7a97c66c2934f7@sentry.io/1429779', 'https://fe8b7df6ea7042f69d7a97c66c2934f7@sentry.io/1429779'],
    publishRelease: false,
    config: {}
  }
}
