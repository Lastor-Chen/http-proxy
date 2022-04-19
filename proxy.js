const express = require('express')
const bodyParser = require('body-parser')
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// input your API target path
const API_HOST = 'http://[host_name]'
const API_PATH = '/api/path'
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

app.use(
  API_PATH,
  createProxyMiddleware({
    target: API_HOST,
    changeOrigin: true, // 不開 true, queryString 會拿不到
    logLevel: 'debug',
    onProxyReq: fixRequestBody, // 如前面有做 bodyParser 則需 fix
    onProxyRes: (proxyRes, req, res) => {
      // 有設 withCredentials 的話, Access-Control-Allow-Origin 不得為 *, 需重設 origin
      const origin = req.headers.origin
      proxyRes.headers['Access-Control-Allow-Origin'] = origin
    },
  })
)

app.listen(PORT, () => {
  console.log('Proxy server is running.')
})
