require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const initDb = require('./config/initDb');

const app = express();

// ─── VIEW ENGINE ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));


app.use(session({
  secret: process.env.SESSION_SECRET || 'ems_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentAdmin = req.session.admin || null;
  next();
});

// ─── ROUTES ────────────────────────────────────────────────────────────────────
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/', employeeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found!' });
});

// ─── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
initDb().catch(err => {
  console.error('Database initialization failed:', err.message);
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`✅  EMS running on http://localhost:${PORT}`);
  console.log('🚀 ================================');
  console.log('');
});
