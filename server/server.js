const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const { getErrorMessage } = require("./src/utils/errors");
const { HttpError } = require("./src/utils/errors");
const config = require("./src/utils/config");
const bodyParser = require("body-parser");
const cors = require("cors");

process.on("unhandledRejection", (err) => console.error(err));
mongoose.Promise = global.Promise;
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(config.db, mongooseOptions);
const db = mongoose.connection;

db.on("error", (err) => {
  console.error("Mongoose error", err);
});

db.once("open", async () => {
  console.log("Connected To", config.db);

  const apiRoutes = require("../server/src/routes/api"); // eslint-disable-line
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(cors());

  /* Middleware to intercept response object having error status code 
      and attach response data to the active span to get meaningful error message in Datadog  */

  app.use((req, res, next) => {
    const sendResponse = res.json;
    res.json = function (data) {
      const responseCodesToIntercept = [400, 401, 403, 500];
      if (responseCodesToIntercept.includes(res?.statusCode)) {
        const span = tracer.scope().active();
        span.setTag("error.type", "Error");
        span.setTag("error.message", JSON.stringify(data));
      }
      res.json = sendResponse;
      return res.json(data);
    };
    next();
  });

  app.use("/api/", apiRoutes(app));

  // Error handler
  app.use((err, req, res, next) => {
    if (!err) return next();

    // Dont log client errors or during testing
    if (process.env.NODE_ENV !== "test" && !(err instanceof HttpError)) {
      console.error(err);
    }

    const error = getErrorMessage(err);
    res.status(error.status).json({
      message: error.message,
      ...(error.paths ? { paths: err.paths } : {}),
    });
  });

  app.listen(config.port, (err) => {
    if (err) throw err;
    console.log("Server listen on port : ", config.port);
  });
});
