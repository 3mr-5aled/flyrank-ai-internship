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

## Optional extras added

- Filtering: `GET /tasks?done=true` returns only finished tasks.
- Search: `GET /tasks?search=milk` returns tasks whose title contains the word.
- Stats: `GET /stats` returns `{ "total": N, "done": D, "open": O }`.
- Seed & reset: `POST /reset` restores the example tasks (useful for demos).

Mortality experiment (what happens when you restart the server):

1. Create a few tasks using `POST /tasks`.
2. Restart the server and call `GET /tasks`.

You will see the tasks you created earlier are gone — the server returns the seeded example tasks. This happens because tasks are kept only in memory; restarting the Node process clears that memory. That transient behavior is intentional for this exercise and is why later weeks introduce persistent storage.

Extras: filtering by `done`, text search, `/stats`, and `/reset` endpoint.

## License

MIT

---

## Stage 7 — AI vs me

### The prompt I wrote (from memory, no copy-paste from the spec)

> Build a REST API in Node.js with Express. Use **in-memory storage only — no
> database**. Expose five core endpoints:
>
> - `GET /tasks` — list all tasks, return 200; return 404 if the list is empty.
> - `GET /tasks/:id` — return 200 with the task or 404 if not found.
> - `POST /tasks` — body must have a `title` string; missing title → 400; on
>   success return 201 with the new task object `{ id, title, done: false }`.
> - `PUT /tasks/:id` — body must supply at least one of `title` or `done`; empty
>   or unrecognised body → 400; task not found → 404; success → 200 with the
>   updated task.
> - `DELETE /tasks/:id` — 204 No Content on success, 404 if not found.
>
> IDs must auto-increment (integer). Also add `GET /` (API info object) and
> `GET /health` returning `{ status: "ok" }`. Seed **two tasks** on startup.
> Serve a Swagger UI at `/docs` backed by an OpenAPI 3.0 JSON spec at
> `/openapi.json`. Run on port 3001 so both servers can run simultaneously.

The AI-generated code lives in [`ai-version/`](./ai-version/) and is completely
separate — the hand-built `server.js` above is untouched.

---

### What the AI did better

1. **Auto-increment counter (`nextId`).** My version recomputes the id with
   `tasks.length + 1`, which produces duplicate IDs after any deletion (delete
   task 1, add a new task → it gets id 1 again). The AI used a persistent
   `nextId` variable that only ever goes up.

2. **`POST /tasks` validation is stricter.** My version never actually validates
   `title` — the `POST /tasks` handler was accidentally written to handle
   *filtering/search* instead of *creating* (the filter logic was misplaced
   there). The AI validates that `title` is a non-empty string and returns 400
   if it is missing or blank.

3. **`GET /tasks` is on the right route.** In my version the filter+search logic
   ended up inside `POST /tasks` instead of `GET /tasks`, meaning my create
   endpoint does the wrong thing entirely. The AI correctly wired filtering to
   the GET handler and creation to POST.

### What the AI got wrong or quietly ignored

1. **`/reset` registered inside `PUT /tasks/:id`.** In my version, the
   `app.post("/reset", ...)` call is *nested inside* the `PUT` handler — so
   `/reset` only gets registered if a `PUT` request is made first. The AI
   placed `/reset` at the module's top level. I never mentioned this bug in my
   prompt, but the AI quietly fixed it because it just wrote clean code top-to-bottom.

2. **`GET /tasks` had a double-send bug.** My `GET /tasks` calls
   `res.status(404).send(...)` without `return`, so if the list is empty the
   server crashes with a "headers already sent" error. The AI used `return`
   consistently. My prompt described the *intent* correctly but the AI also
   deduced the `return` guard from good practice.

3. **The OpenAPI spec has a duplicate `paths` key.** My `openapi.json` declares
   `"paths"` twice — once for the main routes and once for `/stats` and
   `/reset`. JSON parsers silently let the second key win, so the Swagger UI
   only shows stats/reset and hides tasks entirely. The AI produced one unified
   `paths` block.

### What my prompt forgot to specify (and what the AI silently decided)

- **ID behaviour after deletion** — I never said "IDs must never reuse". The AI
  chose a safe auto-increment counter; my code chose the unsafe length-based
  approach. Both are valid readings of a silent spec.
- **Trim whitespace from `title`** — The AI calls `title.trim()` before storing.
  I never asked for that, but it's good hygiene. My prompt was silent on it.
- **`res.json()` vs `res.send()`** — I said nothing about serialisation
  helpers. The AI consistently used `res.json()`; I mixed `res.send()` and
  `res.json()`. Both work the same way in Express 5, but `res.json()` is more
  explicit and intent-revealing.

---

### One rematch

**Improved prompt addition:**
> "After every DELETE, IDs must never be reused — use a persistent counter that
> only increments. Validate that `POST /tasks` body contains a non-empty `title`
> string and return 400 otherwise. Use `return` before every error response to
> prevent double-send crashes."

**What changed:** The second generation correctly used `nextId++` (no duplicate
IDs), added the `title.trim() === ""` guard, and had zero missing-`return` bugs.
The spec detail about auto-increment ID safety was the single biggest gap in my
first prompt.

---

### Quick diff summary

| Area | Hand-built (`server.js`) | AI version (`ai-version/server.js`) |
|---|---|---|
| ID generation | `tasks.length + 1` (breaks after DELETE) | `nextId++` persistent counter ✅ |
| POST /tasks body | filters/searches (wrong handler!) | validates + creates task ✅ |
| Double-send guard | missing `return` on 404 path | `return` on every early exit ✅ |
| `/reset` registration | nested inside PUT handler (bug) | top-level route ✅ |
| OpenAPI spec | two `"paths"` keys (invalid) | one unified `paths` block ✅ |
| Title validation | none | non-empty string check + trim ✅ |
| Serialisation | `res.send()` (inconsistent) | `res.json()` everywhere ✅ |

> **The lesson:** The AI's output was exactly as good as my specification — and
> I could only judge it because I had built the thing myself first.
