require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const middleware = require("./routes/middleware");
const { response } = require("./utils/response");

const app = express();

app.use(express.json());
app.use(middleware.limiter);
app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.use(cors());

app.use(middleware.setLocalTime);

app.get("/", (req, res) => {
  res.json({ msg: "asasasas" });
});

app.use("/api/", require("./routes/routes"));

const server = http.createServer(app);

server.listen(process.env.APP_PORT, "0.0.0.0", (req, res) => {
  console.log(`server run on port ${process.env.APP_PORT}`);
});
