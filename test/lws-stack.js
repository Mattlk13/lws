const Tom = require('test-runner').Tom
const a = require('assert')
const fetch = require('node-fetch')
const Lws = require('../index')

const tom = module.exports = new Tom('lws-stack')

tom.test('No middleware', async function () {
  const port = 9800 + this.index
  const lws = Lws.create({ port })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 404)
})

tom.test('One middleware', async function () {
  const port = 9800 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        ctx.body = 'one'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 200)
  const body = await response.text()
  a.strictEqual(body, 'one')
})

tom.test('Two middlewares', async function () {
  const port = 9800 + this.index
  class One {
    middleware (options) {
      return (ctx, next) => {
        ctx.body = 'one'
        next()
      }
    }
  }
  class Two {
    middleware (options) {
      return (ctx, next) => {
        ctx.body += 'two'
        next()
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: [ One, Two ]
  })
  const response = await fetch(`http://localhost:${port}`)
  lws.server.close()
  const body = await response.text()
  a.strictEqual(body, 'onetwo')
})

tom.test('Broken middleware', async function () {
  const port = 9800 + this.index
  class One {
    middleware () {
      return function (ctx, next) {
        throw new Error('broken')
      }
    }
  }
  const lws = Lws.create({
    port,
    stack: One
  })
  const response = await fetch(`http://localhost:${port}/`)
  lws.server.close()
  a.strictEqual(response.status, 500)
})

tom.test('Load one middleware', async function () {
  const port = 9800 + this.index
  const lws = Lws.create({
    port,
    stack: 'lws-static'
  })
  const response = await fetch(`http://localhost:${port}/package.json`)
  lws.server.close()
  a.strictEqual(response.status, 200)
})
