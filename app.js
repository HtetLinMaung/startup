require("dotenv").config();
// const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 6000;

const app = express();

// app.use(
//   "/test",
//   createProxyMiddleware({
//     target: "http://localhost:6001",
//     changeOrigin: true,
//   })
// );
app.use(cors());
app.use(express.json());

app.use("/startup", require("./controllers/AppController"));

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);

module.exports = app;
