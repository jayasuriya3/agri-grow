require('dotenv').config();

const {createProxyMiddleware}  = require('http-proxy-middleware');
const app = require('express')();
const { MS_LMS, GATEWAY_PORT } = process.env;
const PORT = GATEWAY_PORT || 3000;

const lmsHost = MS_LMS === "local" ? 'http://localhost:7000/' : 'https://dev-agri.grow.com/';


app.use('/agriapi/loanmanagement/', createProxyMiddleware ({ target: lmsHost, changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

