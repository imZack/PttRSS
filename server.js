var morgan = require('morgan');
var app = require('./index');
var port = process.env.PORT || 8000;

app.use(morgan(':req[X-Real-IP] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
app.listen(port, function() {
  console.log('Listen on: %s', port);
});

