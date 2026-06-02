function isAuthenticated(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }

  req.flash('error', 'Please login first.');
  return res.redirect('/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.admin) {
    return res.redirect('/');
  }

  return next();
}

module.exports = { isAuthenticated, redirectIfAuthenticated };
