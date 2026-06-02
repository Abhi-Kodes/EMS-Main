const crypto = require('crypto');
const db = require('../config/db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.loginForm = (req, res) => {
  res.render('auth/login', { page: 'login' });
};

exports.registerForm = (req, res) => {
  res.render('auth/register', { page: 'register' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'Name, email and password are required.');
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    if (password !== confirm_password) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/register');
    }

    const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length) {
      req.flash('error', 'This admin email is already registered.');
      return res.redirect('/register');
    }

    await db.query(
      'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashPassword(password)]
    );

    req.flash('success', 'Admin registration complete. Please login.');
    return res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Registration failed: ' + err.message);
    return res.redirect('/register');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/login');
    }

    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email.trim().toLowerCase()]);
    if (!admins.length || admins[0].password_hash !== hashPassword(password)) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.admin = {
      id: admins[0].id,
      name: admins[0].name,
      email: admins[0].email
    };

    return res.redirect('/');
  } catch (err) {
    req.flash('error', 'Login failed: ' + err.message);
    return res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
