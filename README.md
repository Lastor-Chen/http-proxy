# 前端 http-proxy

簡易 Express.js proxy server 腳手架, 用於本機端開發時, 繞過瀏覽器 CORS 同源政策。

示意圖:
```
// Request through proxy
// ===========================================
Client --> Localhost Proxy --> Real API Server

// Response through proxy
// ===========================================
Client <-- Localhost Proxy <-- Real API Server
```

#### Cookie Credentials

此方法僅可處理一般的 CORS 問題，但需要 cookie auth 登入簽章的就沒辦法，因為 localhost 拿不到實際網站使用的 cookie。<br />

解決思路上，由於後端 API 核心需要的是 userId 而非登入驗證，只要有 userId 就能進行 DB CRUD。因此，可以由前端發送請求時，直接送 uid 資訊給後端，就可以繞過無 cookie 的問題。<br />

採用此法時，需要後端配合做這個機制，另外要記得寫個判定，將其限定在開發模式 Only。
```javascript
// Send user id to server
axios.get('http://domain/api/user?uid=[id]')
```

## Usage

理論上你不需要這支 repo 的 git 紀錄, 可以只拉最新一筆, 加快下載
```shell
$ git clone --depth 1 [this_repo_path]
```

或是透過 [degit](https://www.npmjs.com/package/degit) 進行無 history 的 clone
```shell
$ npx degit Lastor-Chen/http-proxy
```

安裝依賴
```
$ pnpm i
```

在 `proxy.js` 設定自己的 `proxyTarget`
```javascript
// input your API target path
const proxyTarget = {
  route: '/api',  // e.g. "/api"
  host: 'http://localhost', // e.g. "https://www.my-api-host.com"
}  
```

啟動 proxy server
```shell
$ pnpm start
or
$ pnpm dev
```

## CORS 設定

如果目標 API 需要 cookie Auth 登入驗證, 前端打 API 時會帶上 withCredentials 設定, `http-proxy-middleware` 預設情況會被擋 CORS。需要在 proxy 接到 response 發回 client 之前, 修改 headers。
```javascript
// Frontend Client
const { data } = await axios.get('TARGET_PATH', { withCredentials: true })

// Proxy Server
createProxyMiddleware({
  onProxyRes: (proxyRes, req, res) => {
    // Access-Control-Allow-Origin 不得為 *, 需重設 origin
    const origin = req.headers.origin
    proxyRes.headers['Access-Control-Allow-Origin'] = origin
  },
})
```

## POST body parser

如果上了 `bodyParser` 的話, `http-proxy-middleware` 處理 POST body 的速度會相當緩慢, 需使用 [fixRequestBody](https://github.com/chimurai/http-proxy-middleware#intercept-and-manipulate-requests) 進行修復。
