# Layered Architecture - Tasks CRUD

This folder contains a **Layered Architecture** implementation of a Tasks CRUD backend.

## Objective

Build a clean and maintainable backend by separating responsibilities into layers.

## Architecture Layers

### 1. Presentation Layer
- Handles HTTP requests/responses.
- Defines API routes and controllers.

### 2. Service (Business) Layer
- Contains business rules and validation logic.
- Coordinates data flow between presentation and data access layers.

### 3. Repository (Data Access) Layer
- Handles all database operations.
- Abstracts persistence details from the service layer.

### 4. Model/Entity Layer
- Defines task data schema or entity structure.

## Expected CRUD Features

- Create a task
- Get all tasks
- Get task by ID
- Update task
- Delete task

## Suggested Folder Structure

```text
Layered-architecture/
├── controllers/        # Request handlers
├── services/           # Business logic
├── repositories/       # DB access logic
├── models/             # Task schema/entity
├── routes/             # API route definitions
├── config/             # App/DB configuration
├── app.js              # App setup
└── server.js           # Server entry point
```

## API Endpoints (Example)

| Method | Endpoint        | Description          |
|--------|------------------|----------------------|
| POST   | `/tasks`         | Create a new task    |
| GET    | `/tasks`         | Get all tasks        |
| GET    | `/tasks/:id`     | Get task by ID       |
| PUT    | `/tasks/:id`     | Update a task        |
| DELETE | `/tasks/:id`     | Delete a task        |

## Benefits of This Approach

- Clear separation of concerns
- Easier testing and debugging
- Better scalability and maintainability

## Notes

- Keep controllers thin.
- Place validation/business decisions in services.
- Keep repositories focused on persistence only.

## Database Documentation

### PostgreSQL Migration
We migrated the application database from **SQLite** to **PostgreSQL** to support production-ready features, concurrent connections, and robust data persistence.
- **Connection Configuration:** The database connection is configured via the `DATABASE_URL` environment variable (e.g., `postgres://username:password@host:port/database`).
- **Automatic Initialization:** On application startup, the repository layer checks if the `tasks` table exists. If it does not, it automatically creates the schema (with auto-incrementing serial IDs and timestamps) and inserts default seed tasks.

### Starting the Project

You can run the application in two ways:

#### Option 1: Using Docker Compose (Recommended)
This spins up the database and the API services in isolated Docker containers with zero manual configuration.
```bash
docker compose up --build
```
Once started:
- The API will be available at [http://localhost:3000](http://localhost:3000)
- Swagger API documentation will be available at [http://localhost:3000/docs](http://localhost:3000/docs)
- PostgreSQL database is exposed on port `5432` with credentials defined in `compose.yaml`.

#### Option 2: Running Locally (Node.js & Local PostgreSQL)
1. Ensure you have a running PostgreSQL instance.
2. Create a `.env` file in the root directory and configure your connection string:
   ```env
   DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the application:
   ```bash
   npm start
   ```

## Containerization Setup

The stack is containerized using two main configuration files:
1. **[Dockerfile](file:///D:/03-Career/02-Internships/Flyrank%20AI%20Intern/Assignments/flyrank-ai-internship/Backend-AI-Engineering/week-03/A3-Containerize-your-stack/manual-version/Dockerfile):** Builds a lightweight production container using `node:20-alpine`, installs only production dependencies, copies the source code, and runs `server.js`.
2. **[compose.yaml](file:///D:/03-Career/02-Internships/Flyrank%20AI%20Intern/Assignments/flyrank-ai-internship/Backend-AI-Engineering/week-03/A3-Containerize-your-stack/manual-version/compose.yaml):** Defines two services:
   - `api`: The Node.js application container, configured to depend on `db` and expose port `3000`.
   - `db`: A PostgreSQL container (`postgres:17`) configured with an active data volume (`taskdata`) to ensure persistent database storage between container restarts.

## Example SQL Query (Stage 4)
We run the following parameterized query to fetch a single task by its ID using the `pg` client:
```sql
SELECT * FROM tasks WHERE id = $1
```

## Reflecting on Migrating to Postgres and Containerization
Migrating to PostgreSQL and containerizing the stack with Docker has significantly simplified local environment setup. Developers no longer need to worry about manually installing or managing local PostgreSQL services. Docker Compose handles orchestrating the database service, volume persistence, and environment linkage out of the box, ensuring that the application environment behaves identically across all development and production environments.

