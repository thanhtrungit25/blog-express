
/*
 * GET article page.
 */

exports.show = function (req, res, next) {
  if (!req.params.slug) return next(new Error('No article slug.'));
  req.collections.articles.findOne({slug: req.params.slug}, function (error, article) {
    if (error) return next(error);
    if (!article.published) return res.send(401);
    res.render('article', article);
  });
};

/*
 * GET article POST page.
 */

exports.post = function (req, res, next) {
  if (!req.body.title)
  res.render('post');
}

/*
 * POST article POST page.
 */

exports.postArticle = function (req, res, next) {
  if (!req.body.title || !req.body.slug || !req.body.text) {
    return res.render('post', {error: 'Fill title, slug and text.'});
  }
  var article = {
    title: req.body.title,
    slug: req.body.slug,
    text: req.body.text,
    published: false
  };
  req.collections.articles.insert(article, function (error, articleResponse) {
    if (error) return next(error)
    return res.render('post', {error: 'Article was added. Publish it on Admin page.'})
  });
};

/*
 * GET articles API.
 */

exports.list = function (req, res, next) {
  req.collections.articles.find({}).toArray(function (error, articles) {
    if (error) return next(error);
    res.send({articles: articles});
  });
};

/*
 * POST article API.
 */

exports.add = function (req, res, next) {
  if (!req.body.article) return next(new Error('No article payload'));
  var article = req.body.article;
  article.published = false;
  req.collections.articles.insert(article, function (error, articleResponse) {
    res.send(articleResponse);
  });
};

/*
 * PUT article API.
 */

exports.edit = function (req, res, next) {
  if (!req.params.id) return next(new Error('No article ID.'));
  req.collections.articles.updateById(req.params.id, {$set: req.body.article}, function(error, count) {
    if (error) return next(error);
    res.send({affectedCount: count});
  })
};

/*
 * DELETE article API.
 */

exports.del = function (req, res, next) {
  if (!req.params.id) return next(new Error('No article ID.'));
  req.collections.articles.removeById(req.params.id, function (error, count) {
    res.send({affectedCount: count});
  });
};

/*
 * GET admin page.
 */

exports.admin = function (req, res, next) {
  req.collections.articles.find({}, {sort: {_id:-1}}).toArray(function (error, articles) {
    if (error) return next(error);
    // console.log(articles);
    res.render('admin', {articles: articles});
  })
};

