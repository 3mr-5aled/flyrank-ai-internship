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
