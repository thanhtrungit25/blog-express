var express = require('express');
var routers = require('./routes');

var http = require('http');
var path = require('path');
var mongoskin = require('mongoskin');
var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog';
var db = mongoskin.db(dbUrl, {safe: true});
var collections = {
  articles: db.collection('articles'),
  users:db.collection('users')
};

var session = require('express-session');
var logger = require('morgan');
var errorHandler = require('errorhandler')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();
app.locals.appTitle = 'blog-express';

// check global
app.use(function (req, res, next) {
  if (!collections.articles || !collections.users) return next(new Error("No collections"));
  req.collections = collections;
  return next();
})

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routers.index);
app.get('/articles/:slug', routers.article.show);

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}