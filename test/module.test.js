import { Nuxt, Builder } from 'nuxt-edge'
import request from 'request-promise-native'

import config from './fixture/nuxt.config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
process.env.PORT = process.env.PORT || 5060
process.env.NODE_ENV = 'production'

const url = path => `http://localhost:${process.env.PORT}${path}`
const get = path => request(url(path))

describe('Module', () => {
  let nuxt

  beforeAll(async () => {
    config.modules.unshift(function() {
      // Add test specific test only hooks on nuxt life cycle
    })

    // Build a fresh nuxt
    nuxt = new Nuxt(config)
    await new Builder(nuxt).build()
    await nuxt.listen(process.env.PORT)
  })

  afterAll(async () => {
    // Close all opened resources
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})
