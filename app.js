require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var donationsRouter = require('./routes/donations');
var campaignsRouter = require('./routes/campaigns');
var categoriesRouter = require('./routes/categories');

var app = express();

  // CORS configuration
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/donations', donationsRouter);
app.use('/campaigns', campaignsRouter);
app.use('/categories', categoriesRouter);

module.exports = app;
