const crypto = require('crypto');
const moment = require('moment');

const postBodyJsonSchema = {
  type: 'object',
  required: ['userName', 'password'],
  properties: {
    userName: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string' },
    role: { type: 'string' },
    operator: { type: 'string' }
  },
}

const putJsonSchema = {
  body: {
    type: 'object',
    required: ['userName', 'password'],
    properties: {
      userName: { type: 'string' },
      password: { type: 'string' },
      phone: { type: 'string' },
      role: { type: 'string' }
    },
  },
  params: {
    type: 'object',
    required: ['id'],
  }
}

const user = async (fastify) => {
  fastify.post('/user', {
    body: postBodyJsonSchema
  }, async(request, reply) => {
    const { userName, password, phone, role, operator } = request.body
    const data = await fastify.knex.select('userName').first().from('users').where({userName})
    if (data) {
      throw new Error('用户名已经存在!')
    }
    // const md5 = crypto.createHash("md5")
    // const newPassword = md5.update(password).digest("hex");
    await fastify.knex.insert({ userName, password, phone, role, operator }).into('users')
    return reply.send({ code: 200, data: 'success' })
  })

  fastify.get('/users', {
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    let users = []
    const params = ['userName', 'id', 'phone', 'role', 'operator', 'createdAt', 'updatedAt']
    if (request.user.role === '超级管理员') {
      users = await fastify.knex.select(params).from('users')
    } else {
      users = [
        request.user
      ]
    }
    return reply.send({ code: 200, data: users })
  })

  fastify.put('/users/:id', {
    ...putJsonSchema,
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    await fastify.knex.where('id', '=', request.params.id)
    .update({
      ...request.body,
      updatedAt: moment.utc().format(),
      operator: request.user.operator
    }).from('users')
    return reply.send({ code: 200, data: 'success' })
  })

  fastify.delete('/users/:id', {
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    await fastify.knex.where('id', '=', request.params.id)
    .del().from('users')
    return reply.send({ code: 200, data: 'success' })
  })
}

module.exports = user