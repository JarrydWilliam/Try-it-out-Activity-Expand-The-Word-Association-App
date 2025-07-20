var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginUserRouter = require('./routes/loginuser');
var registerRouter = require('./routes/register');
var surveyRouter = require('./routes/survey');
var timingsRouter = require('./routes/timings');
var adminreportselectRouter = require('./routes/adminreportselect');
var adminreportresultRouter = require('./routes/adminreportresult');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/")));

app.use('/', indexRouter);
app.use('/loginuser', loginUserRouter);
app.use('/register', registerRouter);
app.use('/survey', surveyRouter);
app.use('/timings', timingsRouter);
app.use('/adminreportselect', adminreportselectRouter);
app.use('/adminreportresult', adminreportresultRouter);

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
