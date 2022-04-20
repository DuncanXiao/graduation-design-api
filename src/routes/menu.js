const crypto = require('crypto');
const omit = require('lodash/omit');

const postJsonSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    parentId: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },
    icon: { type: 'string' },
    order: { type: 'string' }
  },
}

const putJsonSchema = {
  body: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      parentId: { type: 'string' },
      type: { type: 'string' },
      name: { type: 'string' },
      icon: { type: 'string' },
      order: { type: 'string' }
    },
  },
  params: {
    type: 'object',
    required: ['id'],
  }
}

const delJsonSchema = {
  params: {
    type: 'object',
    required: ['id'],
  }
}

const menu = async (fastify) => {
  fastify.post('/menu', {
    body: postJsonSchema,
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    const { url, parentId, type, name, icon, order } = request.body
    const { operator } = request.user
    await fastify.knex.insert({ url, parentId, type, name, icon, order, operator }).into('menu')

    return reply.code(200)
    .send({
      code: 200,
      data: 'success'
    })
  })

  fastify.get('/menu', {
    preHandler: [fastify.authenticate]
  }, async(_request, reply) => {
    const menus = await fastify.knex.select().from('menu')
    const result = []
    menus.forEach(menu => {
      if (!menu.parentId) {
        result.push({
          ...menu,
          children: []
        })
      } else {
        result.forEach(r => {
          if (r.parentId === menu.parentId) {
            r.children.push(menu)
          }
        })
      }
    })
    return reply.code(200)
    .send({
      code: 200,
      data: result
    })
  })

  fastify.put('/menu/:id', {
    body: putJsonSchema,
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    await fastify.knex.where('id', '=', request.params.id)
    .update({
      ...request.body,
      updatedAt: moment.utc().format(),
      operator: request.user.operator
    }).from('menu')
    return reply.code(200)
    .send({
      code: 200,
      data: 'success'
    })
  })

  fastify.delete('/menu/:id', {
    ...delJsonSchema,
    preHandler: [fastify.authenticate]
  }, async(request, reply) => {
    await fastify.knex.where('id', '=', request.params.id)
    .del().from('menu')
    return reply.send({ code: 200, data: 'success' })
  })
}

module.exports = menu