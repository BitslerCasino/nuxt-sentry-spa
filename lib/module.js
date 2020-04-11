import { resolve, join } from 'path'
import consola from 'consola'
import WebpackPlugin from '@sentry/webpack-plugin'
import deepMerge from 'deepmerge'

const logger = consola.withScope('nuxt-spa:sentry')

const filterDisabledIntegration = integrations => Object.keys(integrations)
  .filter(key => integrations[key])

export default function SentrySpa(moduleOptions) {
  const defaults = {
    dsn: process.env.SENTRY_DSN || false,
    disabled: process.env.SENTRY_DISABLED || false,
    initialize: process.env.SENTRY_INITIALIZE || true,
    disableClientSide: process.env.SENTRY_DISABLE_CLIENT_SIDE || false,
    publishRelease: process.env.SENTRY_PUBLISH_RELEASE || true,
    disableClientRelease: process.env.SENTRY_DISABLE_CLIENT_RELEASE || false,
    attachCommits: process.env.SENTRY_AUTO_ATTACH_COMMITS || false,
    sourceMapStyle: 'hidden-source-map',
    repo: process.env.SENTRY_RELEASE_REPO || false,
    clientIntegrations: {
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: { attachProps: true }
    },
    clientIntegrationsEsm: {
      Breadcrumbs: {},
      GlobalHandlers: {},
      LinkedErrors: {},
      UserAgent: {}
    },
    config: {
      environment: this.options.dev ? 'development' : 'production'
    },
    clientConfig: {},
    webpackConfig: {
      include: [],
      ignore: [
        'node_modules',
        '.nuxt/dist/client/img',
        '.nuxt/dist/client/fonts'
      ],
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
  if (options.publishRelease) {
    // Set urlPrefix to match resources on the client. That's not technically correct for the server
    // source maps, but it is what it is for now.
    const publicPath = join(this.options.router.base, this.options.build.publicPath)
    options.webpackConfig.urlPrefix = publicPath.startsWith('/') ? `~${publicPath}` : publicPath

    if (typeof options.webpackConfig.include === 'string') {
      options.webpackConfig.include = [options.webpackConfig.include]
    }

    const { buildDir } = this.options

    if (!options.disableClientRelease) {
      options.webpackConfig.include.push(`${buildDir}/dist/client`)
    }

    if (options.config.release && !options.webpackConfig.release) {
      options.webpackConfig.release = options.config.release
    }

    if (options.attachCommits) {
      options.webpackConfig.setCommits = {
        auto: true
      }

      if (options.repo) {
        options.webpackConfig.setCommits.repo = options.repo
      }
    }
  }
  const initializationRequired = options.initialize && options.dsn
  if (!options.dsn) {
    logger.info('Errors will not be logged because no DSN has been provided')
    return
  }
  const pluginOptions = {
    config: {
      dsn: options.dsn,
      ...options.clientConfig
    },
    initialize: initializationRequired,
    integrationsEsm: filterDisabledIntegration(options.clientIntegrationsEsm)
      .reduce((res, key) => {
        res[key] = options.clientIntegrationsEsm[key]
        return res
      }, {}),
    integrations: filterDisabledIntegration(options.clientIntegrations)
      .reduce((res, key) => {
        res[key] = options.clientIntegrations[key]
        return res
      }, {})
  }
  // Register the client plugin
  if (!options.disabled && !options.disableClientSide) {
    this.addPlugin({
      src: resolve(__dirname, 'sentry.spa.js'),
      fileName: 'sentry.spa.js',
      ssr: false,
      mode: 'client',
      options: pluginOptions
    })
  }

  // Enable publishing of sourcemaps
  if (options.publishRelease && !options.disabled && !this.options.dev) {
    this.nuxt.hook('webpack:config', (webpackConfigs) => {
      for (const config of webpackConfigs) {
        config.devtool = options.sourceMapStyle
      }
      // Add WebpackPlugin to last build config
      const config = webpackConfigs[webpackConfigs.length - 1]
      config.plugins = config.plugins || []
      config.plugins.push(new WebpackPlugin(options.webpackConfig))
      logger.info(`Enabling uploading of release using ${config.devtool} to Sentry`)
    })
  }
}
