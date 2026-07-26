# Tasks CRUD - Prisma ORM Implementation

This folder contains an ORM-based implementation of the Tasks CRUD backend using **Prisma ORM** and **PostgreSQL**.

## Features

- **Layered Architecture:** Clear separation between Presentation (Express routes/controllers), Business Logic (Services), and Data Access (Prisma Repository).
- **Prisma ORM Integration:** Type-safe database queries, schema-driven modeling, and automatic client generation.
- **RESTful Endpoints:**
  - `GET /` - Meta info
  - `GET /health` - Health check
  - `GET /tasks` - List tasks (sorted by title ASC, supports `?done=true|false` and `?search=term`)
  - `GET /tasks/:id` - Get task by ID
  - `POST /tasks` - Create a task
  - `PUT /tasks/:id` - Update task title and/or done status
  - `DELETE /tasks/:id` - Delete a task
  - `GET /stats` - Aggregate task counts (total, done, open)
  - `POST /reset` - Reset database to initial seed tasks
- **Swagger Documentation:** Available at `/docs`.

## Prerequisites & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. Push Schema to PostgreSQL Database:
   ```bash
   npx prisma db push
   ```

4. Run integration tests:
   ```bash
   npm test
   ```

5. Start application:
   ```bash
   npm start
   ```
