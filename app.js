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
  const body = req.body;
  const param = req.params;
  const query = req.query;
  const data = { ...body, ...param, ...query };

  console.log(JSON.stringify(data));
  next();
});

app.use(cors());

app.use(middleware.setLocalTime);

app.use("/api/", require("./routes/routes"));

const server = http.createServer(app);

server.listen(process.env.APP_PORT, "0.0.0.0", (req, res) => {
  console.log(`server run on port ${process.env.APP_PORT}`);
});
