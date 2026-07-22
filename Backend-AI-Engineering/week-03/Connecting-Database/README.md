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

### Why SQLite?
We chose **SQLite** for database storage because:
- **Single File:** The entire database resides in a single, lightweight file.
- **Zero Setup:** Requires no external database servers or complex configuration (just install the `better-sqlite3` driver).
- **Persistence:** It survives server restarts, ensuring data remains intact indefinitely.

### Database Location & Lifecycle
- **Location:** The database file is located at `src/tasks.db`.
- **Automatic Initialization:** Opening the SQLite database file automatically creates it if it doesn't exist. The table schema and three seed tasks are created automatically on application startup if the database is empty, making it completely zero-setup.
- **Git Ignored:** Typically, database files are added to `.gitignore` so each clean clone gets a fresh database with seed tasks.

### Starting the Project
To run the server locally, execute the following command:
```bash
npm start
```

### Example SQL Query (Stage 4)
We run the following query to fetch a single task by its ID:
```sql
SELECT * FROM tasks WHERE id = ?
```

### Database in DB Browser
Below is a visual representation of our database structure and records as seen in **DB Browser for SQLite**:

![DB Browser Screenshot](src/db_browser_screenshot.jpg)

### Reflecting on Changing the Table Shape (Timestamps Extra)
Adding `created_at` and `updated_at` to the existing table felt like doing open-heart surgery on a running database. Because the SQLite database file already existed without these columns, I had to drop the old table and recreate it to avoid column-not-found exceptions; this made me realize why database migration frameworks exist to cleanly evolve schema shapes without losing existing data.
