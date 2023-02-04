const express = require('express');
const {NotFoundError} = require('../utils/errors')

const apiRouter = express.Router();

apiRouter.use(
  (req, res, next) => {
    if (req.path.includes("healthcheck") || req.path.includes("socket.io")) {
      return next();
    }
    awsCognito.cognitoValidator(req, res, next);
  }
);

module.exports = (app) =>
  apiRouter
    .get('/healthcheck', (req, res) => {
      res.send('agri-grow is up and running');
    })
    .all('*', () => {
      throw new NotFoundError();
    });