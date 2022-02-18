import Application, { Context } from 'koa'
import Router from 'koa-router'
import Koa from 'koa'
import Static from 'koa-static'
import path from 'path'
import render from 'koa-ejs'
import KoaSession, { Session } from 'koa-session'
import session from 'koa-session'
import BodyParser from 'koa-bodyparser' // 不好用，无效
import koaBody from 'koa-body'

const app: Application = new Koa()
const router: Router = new Router()

const port = 80
const staticPath = '/static'
const __dirname = path.resolve()

const CONFIG: Partial<session.opts> = {
  key: 'koa.sess' /** (string) cookie key (default is koa.sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling:
    false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew:
    false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
  secure: false /** (boolean) secure cookie 设置为true本地http会报错*/,
}
app.keys = ['koa']
// koa-session
app.use(KoaSession(CONFIG, app))
// koa-static
app.use(Static(path.join(__dirname, staticPath)))

// koa-router
app.use(router.routes()).use(router.allowedMethods)


const index = async (ctx: Context) => {
  if (!ctx.session?.hasLogin) {
    ctx.redirect('/login')
  }

  console.log(router.routes())

  ctx.response.set({
    'Content-Type': 'text/html charset=UTF-8',
  })
  const title = 'koa index'

  await ctx.render('index', {
    title,
  })
}

const login = async (ctx: Context) => {
  if (ctx.method.toLowerCase() === 'post') {
    const { admin, password } = ctx.request.body
    if (admin === 'admin' && password === 'admin') {
      (ctx.session as Session).hasLogin = true
      ctx.redirect('/')
    } else {
      ctx.body='用户名或密码不正确'
    }
  } else {
    ctx.response.set({
      'Content-Type': 'text/plain; charset=UTF-8',
    })
    const title = 'koa login'

    await ctx.render('login', {
      title,
    })
  }
}

render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: false,
})



router.get('/', index)
// koaBody 中间件必须写
router.all('/login', koaBody(), login)

router.get('/api/msg', (ctx: Context) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*',
  })

  ctx.response.body = {
    msg: 'index',
  }
})

app.on('error', (err, ctx) => {
  console.log('err', err)
})

app.listen(port, () => {
  console.log(`listening ${port}`)
})
