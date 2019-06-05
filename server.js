const app = require('./app');

const port = process.env.PORT || 8000;
const ip = process.env.IP || '0.0.0.0';
app.listen(port, ip, () => {
  // eslint-disable-next-line no-console
  console.log('Listen on: %s', port);
});
