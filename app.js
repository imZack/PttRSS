const express = require('express');
const morgan = require('morgan');
const PTTRouter = require('./routes/ptt').router;

const app = express();

app.use(morgan(':req[X-Real-IP] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"')); // jscs:ignore

app.get('/', (req, res) => {
  res.end();
});

app.use(PTTRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).send('Internal Error');
});

module.exports = app;
