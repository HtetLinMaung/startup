require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/startup/docker", require("./controllers/DockerController"));

app.get("/startup", (req, res) => {
  res.send(
    `<div style="height: 100vh; display: flex; justify-content: center; align-items: center;">
    <h1>Startup Server Online</h1>
    </div>`
  );
});

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(console.log);

module.exports = app;
