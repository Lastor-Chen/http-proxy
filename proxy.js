const express = require('express')
const bodyParser = require('body-parser')
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// input your API target path
const proxyTarget = {
  route: '/api',  // e.g. "/api"
  host: 'http://localhost', // e.g. "https://www.myapihost.com"
}
const PORT = 3000

// log basic request info
app.use((req, res, next) => {
  if (req.path === '/favicon.ico') return next()

  console.log(`\n${req.method} ${req.path}`)
  if (req.method === 'GET') {
    console.log('query', req.query)
  } else if (req.method === 'POST') {
    console.log('body', req.body)
  }
  next()
})

// proxy option
/** @type {import('http-proxy-middleware/dist/types').Options} */
const option = {
  target: proxyTarget.host,
  changeOrigin: true, // 不開 true, queryString 會拿不到
  logLevel: 'debug',
  onProxyReq: fixRequestBody, // 如前面有做 bodyParser 則需 fix
  onProxyRes: (proxyRes, req, res) => {
    // 自身允許 CORS
    proxyRes.headers['Access-Control-Allow-Headers'] = '*'

    // 有設 withCredentials 的話, Access-Control-Allow-Origin 不得為 *, 需重設 origin
    const origin = req.headers.origin
    proxyRes.headers['Access-Control-Allow-Origin'] = origin
  },
}

app.use(proxyTarget.route, createProxyMiddleware(option))

app.listen(PORT, () => {
  console.log('Proxy server is running.')
})
