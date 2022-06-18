'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var cors = require('cors');

var indexRouter = require('./src/api/routes/v1/index');
var userRouter = require('./src/api/routes/v1/user');
var memberRouter = require('./src/api/routes/v1/member');
var accountRouter = require('./src/api/routes/v1/account');
var applePassRouter = require('./src/api/routes/v1/applePass');
var userAppoinmentRouter = require('./src/api/routes/v1/userAppointment');
var acuityRouter = require('./src/api/routes/v1/acuity');
var labRouter = require('./src/api/routes/v1/lab');
var labLocationRouter = require('./src/api/routes/v1/labLocation');
var roleRouter = require('./src/api/routes/v1/role');
var submittedTestFormRouter = require('./src/api/routes/v1/submittedTestForm');
var searchResultRouter = require('./src/api/routes/v1/searchResult');
var screenPermissionRouter = require('./src/api/routes/v1/screenPermission');

var app = express();

const options = {
	swaggerDefinition: {
		// openapi: '3.0.1',
		info: {
			title: 'Account Service API',
			version: '1.0.0',
			description: 'Account Service API with Swagger doc'
		},
		schemes: ['http'],
		host: 'localhost:3000',
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		}
	},
	apis: ['./src/models/*.js', './src/api/routes/v1/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/members', memberRouter);
app.use('/accounts', accountRouter);
app.use('/apple-pass', applePassRouter);
app.use('/user-appointment', userAppoinmentRouter);
app.use('/acuity-scheduling', acuityRouter);
app.use('/labs', labRouter);
app.use('/lab-locations', labLocationRouter);
app.use('/roles', roleRouter);
app.use('/submitted-test-form', submittedTestFormRouter);
app.use('/search-result', searchResultRouter);
app.use('/screen-permission', screenPermissionRouter);

module.exports = app;