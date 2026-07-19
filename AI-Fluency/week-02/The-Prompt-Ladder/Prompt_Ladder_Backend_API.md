# Prompt Ladder – Backend API Development

## Baseline Prompt (Version 0)

### Prompt
> Write backend code for a Todo API.

### Representative Output
```js
const express = require("express");
const app = express();

app.get("/todos", (req, res) => {
    res.json([]);
});

app.listen(3000);
```

### Notes

| Category | Observation |
|---|---|
| What changed? | None (baseline). |
| What improved? | N/A |
| What still failed? | No CRUD operations, validation, structure, or error handling. |
| What to try next? | Clearly define the goal. |

---

## Version 1 — Layer Added: Clear Goal

### Prompt
> Build a complete RESTful Todo API using Express.js with CRUD operations.

### Representative Output
```text
GET /todos
POST /todos
PUT /todos/:id
DELETE /todos/:id
```

### Notes

| Category | Observation |
|---|---|
| What changed? | Added a clear goal. |
| What improved? | Generated all CRUD endpoints instead of a single GET route. |
| What still failed? | No persistence assumptions. |
| What to try next? | Add real context. |

---

## Version 2 — Layer Added: Real Context

### Prompt
> Build a complete RESTful Todo API using Express.js with CRUD operations. The project is for a beginner backend internship. Store todos in an in-memory array instead of a database.

### Representative Output
```js
let todos = [];
```

### Notes

| Category | Observation |
|---|---|
| What changed? | Added project context. |
| What improved? | The solution matched the intended assignment and avoided unnecessary database setup. |
| What still failed? | Implementation and explanation were mixed together. |
| What to try next? | Specify the output format. |

---

## Version 3 — Layer Added: Output Format

### Prompt
> Build a complete RESTful Todo API using Express.js with CRUD operations. The project is for a beginner backend internship using an in-memory array. Return: 1) Folder structure 2) server.js 3) API endpoint table 4) Example requests.

### Representative Output
```text
project/
├── server.js
├── package.json
```

### Notes

| Category | Observation |
|---|---|
| What changed? | Specified the output format. |
| What improved? | The answer became easier to navigate. |
| What still failed? | Validation was still limited. |
| What to try next? | Add quality criteria. |

---

## Version 4 — Layer Added: Quality Criteria

### Prompt
> Build a complete RESTful Todo API using Express.js with CRUD operations. The project is for a beginner backend internship using an in-memory array. Return folder structure, server.js, endpoint table, and examples. Quality requirements: proper HTTP status codes, input validation, error handling, REST naming conventions.

### Representative Output
```js
if (!req.body.title) {
  return res.status(400).json({ message: "Title is required" });
}
```

### Notes

| Category | Observation |
|---|---|
| What changed? | Added quality criteria. |
| What improved? | Validation and proper status codes were included. |
| What still failed? | Response was more verbose than necessary. |
| What to try next? | Add review instructions. |

---

## Version 5 — Layer Added: Review Instructions

### Prompt
> Build a complete RESTful Todo API using Express.js with CRUD operations. The project is for a beginner backend internship using an in-memory array. Return folder structure, server.js, endpoint table, and examples. Apply validation, error handling, REST conventions, and finally review your own solution with strengths, limitations, and improvements.

### Representative Output
```text
Strengths:
- CRUD implemented
- Proper status codes

Limitations:
- No database
- No authentication

Improvements:
- MongoDB
- JWT
```

### Notes

| Category | Observation |
|---|---|
| What changed? | Added self-review instructions. |
| What improved? | The model identified weaknesses and suggested practical improvements. |
| What still failed? | Some suggestions extended beyond the assignment scope. |
| What to try next? | None. This prompt is reusable. |

---

## Honest "Didn't Help Much" Moment

Version 3 (Output Format) improved readability and organization, but it did **not** significantly improve the correctness or quality of the generated code.

---

# Final Reusable Prompt

```
Build a complete RESTful Todo API using Express.js.

Context:
This project is intended for a beginner backend internship. Use an in-memory array for storage instead of a database.

Return your response in the following order:
1. Project folder structure
2. Complete server.js implementation
3. Table of all API endpoints
4. Example requests and responses

Quality requirements:
- Follow REST conventions
- Use proper HTTP status codes
- Validate user input
- Handle common errors clearly
- Keep the code beginner-friendly with concise comments

Finally, review your own solution by identifying:
- Strengths
- Limitations
- Suggested improvements
```
