

const request = require("supertest");
const fs = require("fs").promises;

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const { app, server } = require("../index");

afterAll(() => server.close());

describe("Task Management API", () => {
  beforeAll(async () => {
    const originalForceMain = process.env.FORCE_MAIN;
    const originalPort = process.env.PORT;

    process.env.FORCE_MAIN = "1";
    process.env.PORT = "0";
    jest.resetModules();

    const { server: forcedServer } = require("../index");
    await new Promise((resolve) => {
      if (forcedServer.listening) {
        resolve();
        return;
      }
      forcedServer.on("listening", resolve);
    });
    forcedServer.close();

    if (originalForceMain === undefined) {
      delete process.env.FORCE_MAIN;
    } else {
      process.env.FORCE_MAIN = originalForceMain;
    }

    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
    fs.readFile.mockResolvedValue(JSON.stringify({ tasks: [] }));
    fs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("POST /tasks should create a new task", async () => {
    const newTask = {
      title: "API Test Task",
      description: "Testing the API endpoint",
      priority: "high",
      dueDate: "2026-12-31",
      tags: ["api", "test"],
    };

    const res = await request(app).post("/tasks").send(newTask);

    expect(res.status).toBe(201);
    expect(res.body.some((t) => t.title === newTask.title)).toBe(true);
  });

  it("POST /tasks should handle special characters in title", async () => {
    const newTask = {
      title: 'Task with "quotes" & <special> chars',
      description: "Edge case test",
      priority: "medium",
      dueDate: "2026-12-31",
      tags: ["edge"],
    };

    const res = await request(app).post("/tasks").send(newTask);

    expect(res.status).toBe(201);
    expect(res.body.some((t) => t.title.includes("quotes"))).toBe(true);
  });

  it("POST /tasks should handle unicode characters", async () => {
    const newTask = {
      title: "Task with emoji 🎉 and 中文",
      description: "Unicode test",
      priority: "high",
      dueDate: "2026-12-31",
      tags: ["日本語"],
    };

    const res = await request(app).post("/tasks").send(newTask);

    expect(res.status).toBe(201);
    expect(res.body.some((t) => t.title.includes("🎉"))).toBe(true);
  });
});
