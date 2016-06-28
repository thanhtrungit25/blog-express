
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