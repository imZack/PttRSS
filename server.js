var app = require('./index');
var port = process.env.PORT || 8000;

app.listen(port, function() {
  console.log('Listen on: %s', port);
});

