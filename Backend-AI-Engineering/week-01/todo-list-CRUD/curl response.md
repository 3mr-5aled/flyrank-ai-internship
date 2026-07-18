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

## Stage 2 : Read: list and single task

### Request : get /tasks/1

```bash
curl -i http://localhost:3000/tasks/1
```

### Response

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-aKst2jrzuFjYdRudlan+1nM7StI"
Date: Sat, 18 Jul 2026 14:08:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Task 1","done":false}
```

### Request : get /tasks/99

```bash
curl -i http://localhost:3000/tasks/99
```

### Response

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-kQQdPQ+i/Wk9IgXh55Kh5auGltk"
Date: Sat, 18 Jul 2026 14:08:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Task 99 not found"}
```

## Stage 3 : Create: POST a new task

### Request : successful POST

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
```

### Response

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 40
ETag: W/"28-VcHlL1rdV5VR/zl5/j4FsibevS0"
Date: Sat, 18 Jul 2026 14:23:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Buy milk","id":3,"done":false}
```

### Request : missing title

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{}'
```

### Response

```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-53lIJ95lGl3GPLg/Tko6BPJr+/c"
Date: Sat, 18 Jul 2026 14:26:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Title is required"}
```
