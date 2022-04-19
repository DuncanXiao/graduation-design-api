const fp = require('fastify-plugin')
const knex = require('knex')
const { knexSnakeCaseMappers } = require('objection');

const fastifyKnex = (fastify, options, done) => {
  if (!fastify.knex) {
    const con = knex({
      client: 'pg',
      connection: {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        user: process.env.PG_USER,
        password : process.env.PG_PASSWORD,
        database : process.env.PG_DATABASE,
      },
      ...knexSnakeCaseMappers()
    })
    fastify.decorate('knex', con)
  }

  done()
}

module.exports = fp(fastifyKnex, '3.x')
