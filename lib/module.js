import { relative, resolve } from 'path'
import WebpackPlugin from '@sentry/webpack-plugin'
import deepMerge from 'deepmerge'

const logger = require('consola').withScope('nuxt-spa:sentry')

const filterDisabledIntegration = integrations => Object.keys(integrations)
  .filter(key => integrations[key])

export default function sentry(moduleOptions) {
  const publicPath = this.options.build.publicPath
  const buildDirRelative = relative(this.options.rootDir, this.options.buildDir)
  const defaults = {
    dsn: process.env.SENTRY_DSN || false,
    disabled: process.env.SENTRY_DISABLED || false,
    initialize: process.env.SENTRY_INITIALIZE || true,
    disableClientSide: process.env.SENTRY_DISABLE_CLIENT_SIDE || false,
    publishRelease: process.env.SENTRY_PUBLISH_RELEASE || true,
    disableClientRelease: process.env.SENTRY_DISABLE_CLIENT_RELEASE || false,
    clientIntegrations: {
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: { attachProps: true }
    },
    config: {
      environment: this.options.dev ? 'development' : 'production'
    },
    clientConfig: {},
    webpackConfig: {
      include: [],
      ignore: [
        'node_modules',
        `${buildDirRelative}/dist/client/img`,
        `${buildDirRelative}/dist/client/fonts`
      ],
      urlPrefix: publicPath.startsWith('/') ? `~${publicPath}` : publicPath,
      configFile: '.sentryclirc'
    }
  }

  const topLevelOptions = this.options.sentry || {}
  const options = deepMerge.all([defaults, topLevelOptions, moduleOptions])
  options.clientConfig = deepMerge.all([options.config, options.clientConfig])

  if (options.disabled) {
    logger.info('Errors will not be logged because the disable option has been set')
    return
  }

  if (!options.disableClientRelease) {
    options.webpackConfig.include.push(`${buildDirRelative}/dist/client`)
  }

  if (options.config.release && !options.webpackConfig.release) {
    options.webpackConfig.release = options.config.release
  }

  if (!options.dsn) {
    logger.info('Errors will not be logged because no DSN has been provided')
    return
  }
  const plguinOptions = {
    config: {
      dsn: options.dsn,
      ...options.clientConfig
    },
    initialize: options.initialize,
    integrations: filterDisabledIntegration(options.clientIntegrations)
      .reduce((res, key) => (res[key] = options.clientIntegrations[key], res), {})
  }
  logger.info('Options passed to plugin\n', JSON.stringify(options, null, 2))
  // Register the client plugin
  if (!options.disableClientSide) {
    this.addPlugin({
      src: resolve(__dirname, 'sentry.spa.js'),
      fileName: 'sentry.spa.js',
      ssr: false,
      mode: 'client',
      options: plguinOptions
    })
  }

  // Enable publishing of sourcemaps
  this.extendBuild((config, { isClient }) => {
    if (!options.publishRelease || !isClient) return
    if (isClient) config.devtool = 'hidden-source-map'
    if (isClient && this.options.mode !== 'spa') return
    logger.info('Webpack configuration\n', JSON.stringify(options.webpackConfig, null, 2))
    config.plugins.push(new WebpackPlugin(options.webpackConfig))
    logger.info(`Enabling uploading of release using ${config.devtool} to Sentry`)
  })
}
