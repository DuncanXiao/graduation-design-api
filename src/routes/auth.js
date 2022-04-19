const crypto = require('crypto');
const omit = require('lodash/omit');

const authBodyJsonSchema = {
  type: 'object',
  required: ['userName', 'password'],
  properties: {
    userName: { type: 'string' },
    password: { type: 'string' }
  },
}

const auth = async (fastify) => {
  fastify.post('/auth', { // 登录
    body: authBodyJsonSchema
  }, async(request, reply) => {
    const {userName, password} = request.body
    const data = await fastify.knex.select('userName').first().from('users').where({userName})
    if (!data) {
      throw new Error('用户名不存在!')
    }
    // const md5 = crypto.createHash("md5")
    // const newPassword = md5.update(password).digest("hex");
    const result = await fastify.knex.select().first().from('users').where({userName, password})
    if (!result) {
      throw new Error('用户名密码错误!')
    }
    const user = omit(result, ['password'])
    const token = await reply.jwtSign(user, process.env.TOKEN_PRIMARY_KEY);
    reply.setCookie('token', token, {
      domain: '*',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: true
    })
    .code(200)
    .send({
      data: {
        user,
        token
      }
    })
  })

  fastify.get('/logout', {}, async(request, reply) => {
    reply.setCookie('token', '', {
      domain: '*',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: true
    })
    .code(200)
    .send({
      data: 'logout'
    })
  })
}

module.exports = auth