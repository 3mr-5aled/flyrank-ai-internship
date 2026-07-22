# Layered Architecture - Tasks CRUD

This folder contains a **Layered Architecture** implementation of a Tasks CRUD backend, migrated from in-memory storage to a persistent **SQLite** database.

## Objective

Build a clean and maintainable backend by separating responsibilities into layers. The database operations are fully encapsulated within the Repository layer.

## Architecture Layers

### 1. Presentation Layer (`src/routes/`)
- Handles HTTP requests/responses.
- Defines API routes and delegates work to the services layer.

### 2. Service (Business) Layer (`src/services/`)
- Contains business rules and validation logic.
- Coordinates data flow between presentation and repository (data access) layers.
- Agnostic of HTTP and physical database details.

### 3. Repository (Data Access) Layer (`src/repositories/`)
- Handles all database operations using `better-sqlite3`.
- Abstracts persistence details from the service layer.
- Keeps all database schemas and queries localized to this layer.

### 4. Model/Entity Layer
- Defines task data schema and entity structures.

---

## Database Configuration (SQLite)

- **Library**: `better-sqlite3` (Synchronous SQLite driver for Node.js).
- **Database File**: `task.db` (created in the root directory of the workspace).
- **Schema**:
  ```sql
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );
  ```

---

## Expected CRUD Features

- Create a task
- Get all tasks (with optional query filters `?done=` and `?search=`)
- Get task by ID
- Update task (supports updating `title` and/or `done`)
- Delete task
- Reset tasks (re-seeding back to the default tasks: IDs 1, 2, and 3)

## Folder Structure

```text
Layered-architecture/
├── src/
│   ├── middlewares/        # Express middleware (e.g. error-handler.js)
│   ├── routes/             # API route definitions (tasks.routes.js, meta.routes.js)
│   ├── services/           # Business logic (tasks.service.js)
│   ├── repositories/       # DB access logic (tasks.repository.js)
│   ├── error.js            # Custom domain errors (NotFoundError, ValidationError)
│   └── app.js              # App configuration and route bindings
├── task.db                 # SQLite database file (automatically created)
├── openapi.json            # OpenAPI specification for Swagger docs
├── server.js               # Entry point for the server
└── package.json            # Dependencies and start scripts
```

## API Endpoints

| Method | Endpoint        | Description                         |
|--------|------------------|-------------------------------------|
| GET    | `/tasks`         | Get all tasks (supports query args) |
| GET    | `/tasks/:id`     | Get task by ID                      |
| POST   | `/tasks`         | Create a new task                   |
| PUT    | `/tasks/:id`     | Update a task                       |
| DELETE | `/tasks/:id`     | Delete a task                       |
| GET    | `/stats`         | Get basic task stats                |
| POST   | `/reset`         | Reset DB to the original seed tasks |

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Access the Swagger documentation at:
   [http://localhost:3000/docs](http://localhost:3000/docs)
