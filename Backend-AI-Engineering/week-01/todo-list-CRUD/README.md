# Todo List CRUD API

Simple Node/Express CRUD API used for the FlyRank internship exercises. It provides endpoints to create, read, update and delete tasks and includes a Swagger UI for interactive documentation.

## Features

- Create, list, get, update and delete tasks (in-memory store)
- Validates request bodies and returns appropriate HTTP status codes (201, 200, 204, 400, 404)
- OpenAPI spec and Swagger UI available at `/openapi.json` and `/docs`

## Requirements

- Node.js (>=18 recommended)
- npm (bundled with Node.js)

## Install

```bash
cd Backend-AI-Engineering/week-01/todo-list-CRUD
npm install
```

## Run

```bash
npm start
# or: node server.js
```

The server listens on port `3000` by default.

## Endpoints

- `GET /` — API metadata
- `GET /health` — health check
- `GET /tasks` — list tasks (404 if none)
- `GET /tasks/:id` — get task by id (404 if not found)
- `POST /tasks` — create task (JSON body: `{ "title": "..." }`) → 201 Created
- `PUT /tasks/:id` — replace/modify task fields (`title` and/or `done`) → 200 OK
  - Empty or invalid body → 400 Bad Request
  - Unknown id → 404 Not Found
- `DELETE /tasks/:id` — delete task → 204 No Content (empty body)
  - Unknown id → 404 Not Found

## Examples (curl)

Create a task:

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

Update a task:

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy almond milk","done":true}'
```

Delete a task:

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## Swagger UI

Open the interactive docs at:

```
http://localhost:3000/docs/
```

Use the `Try it out` buttons to exercise the full CRUD cycle without curl.

## Notes

- Data is stored in memory (the `tasks` array). Restarting the server resets data.
- This project is intentionally small for learning; for production use, add persistent storage, authentication, and input sanitization.

## License

MIT
