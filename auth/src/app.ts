import express from 'express';
import 'express-async-errors';
// @ts-ignore
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { errorHandler } from '@blog-cms/common';

import { signupRouter } from './routes/signup';
import { signinRouter } from './routes/signin';
import { currentuserRouter } from './routes/currentuser';
import { signoutRouter } from './routes/signout';
import { updatePasswordRouter } from './routes/update-password';
import { changeRoleRouter } from './routes/change-role';
import { updateMeRouter } from './routes/update-me';
import { forgotPasswordRouter } from './routes/forgot-password';
import { resetPasswordRouter } from './routes/reset-password';
import { deleteMeRouter } from './routes/delete-me';
import { signupAdminRouter } from './routes/signup-admin';
import { getAllUsersRouter } from './routes/admin-routes/get-all-users';
import { getUserRouter } from './routes/admin-routes/get-user';
import { createUserRouter } from './routes/admin-routes/create-user';
import { updateUserRouter } from './routes/admin-routes/update-user';
import { deleteUserRouter } from './routes/admin-routes/delete-user';

const app = express();
// traffic is being proxy to our server through ingress nginx, and trust the proxies
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());

// After reading the data from express.json() then sanitize it
// Data sanitization against NoSQL query injection
// This will filter out all of the $ signs and dots ".", because that's how mongodb operators are written
app.use(mongoSanitize());

// Data sanitization against XSS attacks
// This will clean any malicious input from html code, mongoose validation also protects us (because it also doesn't allow any other data into our DB excepts that is specify in the schema)
app.use(xss());

// It will compresses all the responses (only text, and json), "gzip"
app.use(compression());

// Routes
app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(currentuserRouter);
app.use(updatePasswordRouter);
app.use(changeRoleRouter);
app.use(updateMeRouter);
app.use(forgotPasswordRouter);
app.use(resetPasswordRouter);
app.use(deleteMeRouter);
app.use(signupAdminRouter);
// admin specific routes
app.use(getAllUsersRouter);
app.use(getUserRouter);
app.use(createUserRouter);
app.use(updateUserRouter);
app.use(deleteUserRouter);

// Global Error Handler
app.use(errorHandler);

export { app };
