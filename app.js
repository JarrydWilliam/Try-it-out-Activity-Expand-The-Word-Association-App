var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var connectionInfo = require('./lib/dbconfig');
var { init } = require('./database');

var indexRouter = require('./routes/index');
var loginUserRouter = require('./routes/loginuser');
var registerRouter = require('./routes/register');
var surveyRouter = require('./routes/survey');
var timingsRouter = require('./routes/timings');
var adminReportSelectRouter = require('./routes/adminreportselect');
var adminReportResultRouter = require('./routes/adminreportresult');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve Bootstrap and Bootstrap Icons
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/font', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')));

// Public assets
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session store (MySQL)
var sessionStore = new MySQLStore({
  host: connectionInfo.host,
  port: connectionInfo.port,
  user: connectionInfo.user,
  password: connectionInfo.password,
  database: connectionInfo.database,
  createDatabaseTable: true
});

app.use(session({
  key: 'wordassoc.sid',
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Make session available in all views
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

// Ensure tables exist (DB must already exist)
init().catch(err => {
  console.error('Database init failed:', err);
  process.exit(1);
});

// Simple admin gate
function requireAdmin(req, res, next) {
  if (req.session && req.session.logged_in && req.session.role === 'admin') return next();
  return res.redirect('/loginuser');
}

// Routes
app.use('/', indexRouter);
app.use('/loginuser', loginUserRouter);
app.use('/register', registerRouter);
app.use('/survey', surveyRouter);
app.use('/timings', timingsRouter);
app.use('/adminreportselect', requireAdmin, adminReportSelectRouter);
app.use('/adminreportresult', requireAdmin, adminReportResultRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
