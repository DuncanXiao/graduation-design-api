const crypto = require('crypto');
const moment = require('moment');
const omit = require('lodash/omit');

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

const getUsersJsonSchema = {
  query: {
    type: 'object',
    required: ['offset', 'limit'],
    properties: {
      userName: { type: 'string' },
      phone: { type: 'string' },
      role: { type: 'string' },
      operator: { type: 'string' },
      offset: { type: 'number' },
      limit: { type: 'number' }
    },
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
    ...getUsersJsonSchema,
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    let users = []
    const params = ['userName', 'password', 'id', 'phone', 'role', 'operator', 'createdAt', 'updatedAt']
    const { offset = 1, limit = 10, userName } = request.query
    const search = omit(request.query, ['offset', 'limit', 'userName'])
    let total = 1
    if (request.user.role === '超级管理员') {
      users = await fastify.knex.select(params).from('users').where((qb) => {
        if (userName) {
          qb.where('userName', 'like', `%${userName}%`);
        }
        Object.getOwnPropertyNames(search).forEach(function(key){
          qb.orWhere(`${key}`, '=', search[key]);
        });
      }).limit(limit).offset(limit * (offset -1))
      const count = await fastify.knex.count('id').from('users').where((qb) => {
        if (userName) {
          qb.where('userName', 'like', `%${userName}%`);
        }
        Object.getOwnPropertyNames(search).forEach(function(key){
          qb.orWhere(`${key}`, '=', search[key]);
        });
      })
      total = parseInt(count[0].count)
    } else {
      users = [
        request.user
      ]
    }
    return reply.send({ code: 200, data: users, total, offset, limit })
  })

  fastify.get('/user', {
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    let users = []
    const params = ['userName', 'id', 'phone', 'role', 'operator', 'createdAt', 'updatedAt']
    users = await fastify.knex.select(params).first().from('users').where('id', '=', request.user.id)

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
      operator: request.user.userName
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