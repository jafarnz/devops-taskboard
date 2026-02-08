

const { addTask } = require("../utils/jafarUtil");
const fs = require("fs").promises;


jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return {
    ...actualFs,
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});


jest.mock("../models/Task", () => {
  return jest.fn().mockImplementation((data) => ({
    id: "test-id-" + Date.now(),
    title: data.title,
    description: data.description,
    priority: data.priority,
    dueDate: data.dueDate,
    tags: data.tags,
    status: "pending",
    createdAt: new Date().toISOString(),
  }));
});

describe("jafarUtil - addTask", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();

    mockReq = {
      body: {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
        dueDate: "2026-12-31",
        tags: ["test", "unit"],
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    fs.readFile.mockResolvedValue(JSON.stringify({ tasks: [] }));
    fs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    console.error.mockRestore();
  });


  it("should create task and return 201", async () => {
    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalled();
    expect(Array.isArray(mockRes.json.mock.calls[0][0])).toBe(true);
  });

  it("should add task to existing tasks array", async () => {
    fs.readFile.mockResolvedValue(
      JSON.stringify({ tasks: [{ id: "existing-1", title: "Existing" }] })
    );

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json.mock.calls[0][0].length).toBe(2);
  });

  it("should write task to file", async () => {
    await addTask(mockReq, mockRes);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("taskboard.json"),
      expect.any(String),
      "utf8"
    );
  });

  it("should write properly formatted JSON", async () => {
    await addTask(mockReq, mockRes);

    const writtenContent = fs.writeFile.mock.calls[0][1];
    expect(() => JSON.parse(writtenContent)).not.toThrow();
  });


  it("should create file from template when taskboard.json missing (ENOENT)", async () => {
    const enoentError = new Error("File not found");
    enoentError.code = "ENOENT";

    fs.readFile
      .mockRejectedValueOnce(enoentError) // taskboard.json missing
      .mockResolvedValueOnce(JSON.stringify({ tasks: [] })); // template exists

    await addTask(mockReq, mockRes);

    expect(fs.readFile).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should initialize tasks array when undefined", async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ metadata: "data" }));

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(Array.isArray(mockRes.json.mock.calls[0][0])).toBe(true);
  });

  it("should handle null tasks property", async () => {
    fs.readFile.mockResolvedValue(JSON.stringify({ tasks: null }));

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should handle special characters in request body", async () => {
    mockReq.body.title = 'Task with "quotes" & <special>';

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });


  it("should return 500 on file read permission error", async () => {
    const permError = new Error("Permission denied");
    permError.code = "EACCES";
    fs.readFile.mockRejectedValue(permError);

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Permission denied" });
  });

  it("should return 500 on JSON parse error", async () => {
    fs.readFile.mockResolvedValue("invalid json {{{");

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it("should return 500 on file write error", async () => {
    fs.writeFile.mockRejectedValue(new Error("Disk full"));

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Disk full" });
  });

  it("should return 500 when template file also missing", async () => {
    const enoentError = new Error("File not found");
    enoentError.code = "ENOENT";

    fs.readFile
      .mockRejectedValueOnce(enoentError) 
      .mockRejectedValueOnce(enoentError); 

    await addTask(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
