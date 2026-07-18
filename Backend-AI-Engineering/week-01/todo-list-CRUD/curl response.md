# Curl Response

## Stage 0 : Hello, server

### Request

```bash
curl -i http://localhost:3000/
```

### Response

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 12
ETag: W/"c-Lve95gjOVATpfV8EL5X4nxwjKHE"
Date: Sat, 18 Jul 2026 13:55:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Hello World!
```

## Stage 1 : Your first real endpoint

### Request : get /

```bash
curl http://localhost:3000/
```

### Response

```json
{ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] }
```

### Request : get /health

```bash
curl http://localhost:3000/health
```

### Response

```json
{ "status": "ok" }
```
