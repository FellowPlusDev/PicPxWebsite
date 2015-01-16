DeepPic
=========

准备配置文件，然后修改为合适的值

```
cp config/upyun.json.example config/upyun.json
```

其中

 * bucket: 为空间的名称
 * username: 为操作员用户名
 * password: 为操作员密码
 * baseUrl: 为域名，比如 `http://deeppic-test.b0.upaiyun.com/`

操作员可以在 **通用 - 操作员授权** 中创建，域名可以在 **通用 - 高级功能** 中找到。

----

安装依赖

```
npm install
```

---

启动本地测试 server

```
env NODE_ENV=development ./bin/www
```