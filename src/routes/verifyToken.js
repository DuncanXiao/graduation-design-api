const crypto = require('crypto');
const omit = require('lodash/omit');

const verify = async (fastify) => {
  fastify.get('/verifycookie', async(request, reply) => {
    try {
      console.log(111111, request.cookies.token)
      await fastify.jwt.verify(request.cookies.token)
      reply.send({ code: 'OK', message: 'it works!' })
    }
    catch(error){
      reply.send(error);
    }
  })
  fastify.get('/verifytoken', {preHandler: [fastify.authenticate]}, async(request, reply) => {
    try {
      reply.send({ code: 'OK', message: 'it works!' })
    }
    catch(error){
      reply.send(error);
    }
  })
}

module.exports = verify