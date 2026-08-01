require("dotenv").config();
const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const { createApp } = require("./src/app");

test("Tasks API Endpoints Integration Test Suite", async (t) => {
  let server;
  let port;
  let baseUrl;

  // Set up: Boot Express application on a random free port
  t.before(() => {
    return new Promise((resolve) => {
      const app = createApp();
      server = http.createServer(app);
      server.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });
  });

  // Tear down: Close the server
  t.after(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  // Helper function for API calls
  async function apiRequest(path, options = {}) {
    const url = `${baseUrl}${path}`;
    if (options.body && typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
      options.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    }
    const response = await fetch(url, options);
    let data = null;
    if (response.status !== 204) {
      data = await response.json();
    }
    return { status: response.status, data };
  }

  // 1. Meta information route
  await t.test("GET / - returns meta information", async () => {
    const { status, data } = await apiRequest("/");
    assert.strictEqual(status, 200);
    assert.strictEqual(data.name, "Task API");
    assert.ok(Array.isArray(data.endpoints));
  });

  // 2. Health check route
  await t.test("GET /health - returns ok status", async () => {
    const { status, data } = await apiRequest("/health");
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, "ok");
  });

  // 3. DB Reset route (initializes test environment data)
  await t.test("POST /reset - resets database tasks", async () => {
    const { status, data } = await apiRequest("/reset", { method: "POST" });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.message, "Tasks reset to default");
    assert.ok(Array.isArray(data.tasks));
    assert.strictEqual(data.tasks.length, 3);
  });

  // 4. List all tasks (default alphabetical sorting by title ASC)
  await t.test("GET /tasks - gets all tasks in title order", async () => {
    const { status, data } = await apiRequest("/tasks");
    assert.strictEqual(status, 200);
    assert.strictEqual(data.length, 3);
    assert.strictEqual(data[0].title, "Build a REST API"); // sorted alphabetically first
  });

  // 5. Create task
  let createdTaskId;
  await t.test("POST /tasks - creates a new task", async () => {
    const { status, data } = await apiRequest("/tasks", {
      method: "POST",
      body: { title: "Automated test task" },
    });
    assert.strictEqual(status, 201);
    assert.ok(data.id);
    assert.strictEqual(data.title, "Automated test task");
    assert.strictEqual(data.done, false);
    createdTaskId = data.id;
  });

  // 6. Get task by ID
  await t.test("GET /tasks/:id - returns task by ID", async () => {
    const { status, data } = await apiRequest(`/tasks/${createdTaskId}`);
    assert.strictEqual(status, 200);
    assert.strictEqual(data.id, createdTaskId);
    assert.strictEqual(data.title, "Automated test task");
  });

  // 7. Get non-existent task
  await t.test("GET /tasks/:id - returns 404 for invalid ID", async () => {
    const { status, data } = await apiRequest("/tasks/99999");
    assert.strictEqual(status, 404);
    assert.ok(data.error);
  });

  // 8. Update task (title & done)
  await t.test(
    "PUT /tasks/:id - updates task title and done status",
    async () => {
      const { status, data } = await apiRequest(`/tasks/${createdTaskId}`, {
        method: "PUT",
        body: { title: "Updated automated test task", done: true },
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.title, "Updated automated test task");
      assert.strictEqual(data.done, true);
    },
  );

  // 9. Statistics verification
  await t.test("GET /stats - returns counts", async () => {
    const { status, data } = await apiRequest("/stats");
    assert.strictEqual(status, 200);
    assert.ok("total" in data);
    assert.ok("done" in data);
    assert.ok("open" in data);
  });

  // 10. Filter tasks (by done status)
  await t.test(
    "GET /tasks?done=true - filters tasks by done = true",
    async () => {
      const { status, data } = await apiRequest("/tasks?done=true");
      assert.strictEqual(status, 200);
      assert.ok(data.every((t) => t.done === true));
    },
  );

  // 11. Delete task
  await t.test("DELETE /tasks/:id - deletes task", async () => {
    const { status } = await apiRequest(`/tasks/${createdTaskId}`, {
      method: "DELETE",
    });
    assert.strictEqual(status, 204);

    // Verify it no longer exists
    const { status: getStatus } = await apiRequest(`/tasks/${createdTaskId}`);
    assert.strictEqual(getStatus, 404);
  });
});
