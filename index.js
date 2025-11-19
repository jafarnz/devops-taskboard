const express = require("express");
const path = require("path");
const { editTask } = require("./utils/updateUtils");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.put("/tasks/:id", editTask);

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
