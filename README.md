
# @bitsler/nuxt-sentry-spa
[![npm (scoped with tag)](https://img.shields.io/npm/v/@bitsler/nuxt-sentry-spa/latest.svg?style=flat-square)](https://npmjs.com/package/@bitsler/nuxt-sentry-spa)
[![npm](https://img.shields.io/npm/dt/@bitsler/nuxt-sentry-spa.svg?style=flat-square)](https://npmjs.com/package/@bitsler/nuxt-sentry-spa)
[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com)

> Sentry module for Nuxt.js SPA build

## Features

The module enables error logging through [Sentry](http://sentry.io).

- This is an abstraction of `sentry.client.js` from `https://github.com/nuxt-community/sentry-module` for use with SPA build ONLY!

## Setup
- Add `@bitsler/nuxt-sentry-spa` dependency using yarn or npm to your project
- Add `@bitsler/nuxt-sentry-spa` to `modules` section of `nuxt.config.js`

```js
{
  modules: [
    '@bitsler/nuxt-sentry-spa',
  ],

  sentry: {
    dsn: '', // Enter your project's DSN here
    config: {}, // Additional config
  }
}
```

### Nuxt compatibility
Versions of NuxtJS before v2.4.0 are **not** supported by this package.

## Usage

Enter your DSN in the NuxtJS config file. Additional config settings can be found [here](https://docs.sentry.io/clients/javascript/config/).

## Options

Options can be passed using either environment variables or `sentry` section in `nuxt.config.js`.
Normally setting required DSN information would be enough.

### dsn
- Type: `String`
  - Default: `process.env.SENTRY_DSN || false`
  - If no `dsn` is provided, Sentry will be initialised, but errors will not be logged. See [#47](https://github.com/nuxt-community/sentry-module/issues/47) for more information about this.

### disabled
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLED || false`
  - Sentry will not be initialised if set to `true`.

### disableClientSide
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_CLIENT_SIDE || false`

### initialize
- Type: `Boolean`
  - Default: `process.env.SENTRY_INITIALIZE || true`

### publishRelease
- Type: `Boolean`
  - Default: `process.env.SENTRY_PUBLISH_RELEASE || true`
  - See https://docs.sentry.io/workflow/releases for more information

### disableClientRelease
- Type: `Boolean`
  - Default: `process.env.SENTRY_DISABLE_CLIENT_RELEASE || false`
  - See https://docs.sentry.io/workflow/releases for more information

### clientIntegrations
- Type: `Dictionary`
  - Default:
  ```
   {
      Dedupe: {},
      ExtraErrorData: {},
      ReportingObserver: {},
      RewriteFrames: {},
      Vue: {attachProps: true}
   }
  ```
  - See https://docs.sentry.io/platforms/node/pluggable-integrations/ for more information

### config
- Type: `Object`
  - Default: `{
    environment: this.options.dev ? 'development' : 'production'
  }`

### clientConfig
- Type: `Object`
  - Default: `{
  }`
  - If specified, values will override config values for client sentry plugin

## Submitting releases to Sentry
- You can pass the options for `@sentry/webpack-plugin` as a environment variable
Example:
```
SENTRY_ORG=yourorig
SENTRY_PROJECT=projectname
SENTRY_DSN=https://yourdsn@sentry.io/2
```

Note that releases are only submitted to Sentry when `(options.publishRelease && !isDev)` is true.

## License
[MIT License](./LICENSE)


