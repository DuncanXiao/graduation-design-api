require('module-alias/register');
const dotenv = require('dotenv')
const server = require('fastify')({
  logger: true
})
const autoLoad = require('fastify-autoload')
const path = require('path')
const fastifyKnex = require('./plugins/knex')
dotenv.config()

server.register(require('fastify-jwt'), {
  secret: process.env.TOKEN_PRIMARY_KEY,
  cookie: {
    cookieName: 'token'
  }
})
server.register(require('fastify-cookie'))
server.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})
server.register(fastifyKnex, {})
server.register(autoLoad, {
  dir: path.join(__dirname, 'routes'),
  options: Object.assign({ prefix: '/api' })
})

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})