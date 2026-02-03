const express = require("express");
const path = require("path");

const { editTask } = require("./utils/ethanUtils");

const { addTask } = require("./utils/jafarUtil");

const { getAllTasks, getTaskById } = require("./utils/getTasksUtil");

const { deletedTask } = require("./utils/syakirahUtil");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/tasks", getAllTasks);
app.get("/tasks/:id", getTaskById);
app.post("/tasks", addTask);
app.put("/tasks/:id", editTask);
app.delete("/tasks/:id", deletedTask);

app.use(express.static(path.join(__dirname, "public")));

const shouldListenOnPort =
  require.main === module || process.env.FORCE_MAIN === "1";
let server;
if (shouldListenOnPort) {
  console.log("Attempting to listen on port " + PORT);
  server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} else {
  server = app.listen(0); // Random port for testing
}

module.exports = { app, server };
