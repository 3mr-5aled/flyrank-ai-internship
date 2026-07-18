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

## Stage 4 : Update & Delete (full CRUD)

### Request : update task (replace title and/or done)

```bash
curl -i -X PUT http://localhost:3000/tasks/3 -H "Content-Type: application/json" -d '{"title":"Checkpoint2 updated","done":true}'
```

### Response (200 OK)

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 50
ETag: W/"32-5R7RXhvNKelGG1q9K8+nLYO1y+Q"
Date: Sat, 18 Jul 2026 15:38:09 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Checkpoint2 updated","id":3,"done":true}
```

### Request : update with empty/invalid body

```bash
curl -i -X PUT http://localhost:3000/tasks/3 -H "Content-Type: application/json" -d '{}'
```

### Response (400 Bad Request)

```http
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 50
ETag: W/"1e-XXXXXXXXXXXXXXXXXXXX"
Date: Sat, 18 Jul 2026 15:XX:XX GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"No valid fields provided for update"}
```

### Request : update unknown id

```bash
curl -i -X PUT http://localhost:3000/tasks/99 -H "Content-Type: application/json" -d '{"title":"Does not exist"}'
```

### Response (404 Not Found)

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-YYYYYYYYYYYYYYYYYYYY"
Date: Sat, 18 Jul 2026 15:XX:XX GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Task 99 not found"}
```

### Request : delete task

```bash
curl -i -X DELETE http://localhost:3000/tasks/3
```

### Response (204 No Content)

```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Date: Sat, 18 Jul 2026 15:38:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5

```

### Request : delete unknown id

```bash
curl -i -X DELETE http://localhost:3000/tasks/99
```

### Response (404 Not Found)

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 29
ETag: W/"1d-kQQdPQ+i/Wk9IgXh55Kh5auGltk"
Date: Sat, 18 Jul 2026 15:41:25 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Task 99 not found"}
```

**CHECKPOINT:** Create (201), Update (200), Mark done (200), Delete (204) — confirmed.

## Stage 4 — Actual checkpoint run outputs

Run on: Sat, 18 Jul 2026

1. Create task

Request:

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Run-checkpoint"}'
```

Response:

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 46
ETag: W/"2e-bc+zrlsqTPAZRzPsxv4gtp25hBk"
Date: Sat, 18 Jul 2026 15:39:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Run-checkpoint","id":3,"done":false}
```

2. List tasks (confirm)

Request:

```bash
curl -i http://localhost:3000/tasks
```

Response:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 125
ETag: W/"7d-FxANIyF3DTVcye5sdKksD8B25VY"
Date: Sat, 18 Jul 2026 15:39:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Task 1","done":false},{"id":2,"title":"Task 2","done":true},{"title":"Run-checkpoint","id":3,"done":false}]
```

3. Update title (PUT)

Request:

```bash
curl -i -X PUT http://localhost:3000/tasks/3 -H "Content-Type: application/json" -d '{"title":"Run-checkpoint-updated"}'
```

Response:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 54
ETag: W/"36-BOlJhWqXUDh96mVGS6dDq+5Y7ks"
Date: Sat, 18 Jul 2026 15:39:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Run-checkpoint-updated","id":3,"done":false}
```

4. Mark done (PUT)

Request:

```bash
curl -i -X PUT http://localhost:3000/tasks/3 -H "Content-Type: application/json" -d '{"done":true}'
```

Response:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 53
ETag: W/"35-4a3kG/T3yudKm2gY6v5v7/X3YuE"
Date: Sat, 18 Jul 2026 15:39:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Run-checkpoint-updated","id":3,"done":true}
```

5. Delete (DELETE)

Request:

```bash
curl -i -X DELETE http://localhost:3000/tasks/3
```

Response:

```http
HTTP/1.1 204 No Content
X-Powered-By: Express
Date: Sat, 18 Jul 2026 15:40:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

```

6. Confirm deletion (GET)

Request:

```bash
curl -i http://localhost:3000/tasks/3
```

Response:

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 28
ETag: W/"1c-U9Mog/I+YfPZVcyNNEtBW2Yi26g"
Date: Sat, 18 Jul 2026 15:40:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Task 3 not found"}
```
