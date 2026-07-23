# Layered Architecture - Tasks CRUD with Docker & PostgreSQL

This folder contains a **Layered Architecture** implementation of a Tasks CRUD backend, containerized with **Docker** and migrated to a persistent **PostgreSQL** database.

## Objective

Build a clean and maintainable backend by separating responsibilities into layers. The database operations are fully encapsulated within the Repository layer. The stack is fully containerized using Docker and Docker Compose.

## Architecture Layers

### 1. Presentation Layer (`src/routes/`)
- Handles HTTP requests/responses.
- Defines API routes and delegates work to the services layer using `async/await`.

### 2. Service (Business) Layer (`src/services/`)
- Contains business rules and validation logic.
- Coordinates data flow between presentation and repository layers.
- Agnostic of HTTP and physical database details.

### 3. Repository (Data Access) Layer (`src/repositories/`)
- Handles all database operations using the official `pg` PostgreSQL client.
- Abstracts persistence details from the service layer.
- Keeps all database schemas, table creation, and queries localized to this layer.
- Handles database connection checking and includes automatic startup retry logic.

### 4. Model/Entity Layer
- Defines task data schema and entity structures.

---

## Database Configuration (PostgreSQL)

- **Library**: `pg` (PostgreSQL client for Node.js).
- **Database Service Name**: `db` (within the Docker Compose network).
- **Database Host Port**: `5432`
- **Volume**: A named volume (`pgdata`) is mounted to `/var/lib/postgresql/data` for data persistence.
- **Schema**:
  ```sql
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE
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
├── Dockerfile              # Dockerfile for the API service
├── compose.yaml            # Docker Compose configuration (API & DB services)
├── .env                    # Local environment variables
├── .env.example            # Environment variables template
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

### Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed on your system.
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```
3. Access the Swagger documentation at:
   [http://localhost:3000/docs](http://localhost:3000/docs)

### Running Locally (Without Docker)

1. Ensure PostgreSQL is running on your local machine.
2. Create a `.env` file in the root directory using `.env.example` as a template and provide your database credentials.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access the Swagger documentation at:
   [http://localhost:3000/docs](http://localhost:3000/docs)
