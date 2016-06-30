var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET
var express = require('express');
var routers = require('./routes');
var conf = require('./conf');

var http = require('http');
var path = require('path');
var mongoskin = require('mongoskin');
var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog';
var db = mongoskin.db(dbUrl, {safe: true});
var collections = {
  articles: db.collection('articles'),
  users:db.collection('users')
};

var everyauth = require('everyauth');

var session = require('express-session');
var logger = require('morgan');
var errorHandler = require('errorhandler')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

everyauth.debug = true;
everyauth.twitter
  .consumerKey(conf.twit.consumerKey)
  .consumerSecret(conf.twit.consumerSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var promise = this.Promise();
    process.nextTick(function(){
        if (twitterUserMetadata.screen_name === 'thanhtrungit25') {
          session.user = twitterUserMetadata;
          session.admin = true;
        }
        promise.fulfill(twitterUserMetadata);
    })
    return promise;
    // return twitterUserMetadata
  })
  .redirectPath('/admin');

everyauth.everymodule.handleLogout(routers.user.logout);

everyauth.everymodule.findUserById( function (user, callback) {
  callback(user);
});

var app = express();
app.locals.appTitle = 'blog-express';

// Expose collections to request handlers
app.use(function (req, res, next) {
  if (!collections.articles || !collections.users) return next(new Error("No collections"));
  req.collections = collections;
  return next();
})

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}));
app.use(everyauth.middleware());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// Authenticaton middleware
app.use(function (req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
})

// Authorization Middleware
var authorize = function (req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.send(401);
}

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routers.index);
app.get('/login', routers.user.login);
app.post('/login', routers.user.authenticate);
app.get('/logout', routers.user.logout);
app.get('/admin', authorize, routers.article.admin);
app.get('/post', authorize, routers.article.post);
app.post('/post', authorize, routers.article.postArticle);
app.get('/articles/:slug', routers.article.show);

// REST API routes
app.all('/api', authorize);
app.get('/api/articles', routers.article.list);
app.post('/api/articles', routers.article.add);
app.del('/api/articles/:id', routers.article.del);
app.put('/api/articles/:id', routers.article.edit);

app.all('*', function (req, res) {
  res.send(404);
})

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