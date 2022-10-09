import mongoose from 'mongoose';

import { app } from './app';
import { DatabaseConnectionError } from '@blog-cms/common';

process.on('uncaughtException', err => {
  console.log('🔥🔥🔥', 'uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  console.log('🚀🚀🚀', 'unhandledRejection', err);
});

const start = async () => {
  if (!process.env.JWT_KEY || !process.env.JWT_EXPIRES_IN) {
    throw new Error('JWT_KEY, or JWT_EXPIRES_IN is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error('Email from is not defined');
  }
  if (
    !process.env.MAILTRAP_HOST ||
    !process.env.MAILTRAP_PORT ||
    !process.env.MAILTRAP_USERNAME ||
    !process.env.MAILTRAP_PASSWORD
  ) {
    throw new Error('One of the mailtrap configurations are not defined');
  }
  if (!process.env.SENDINBLUE_USERNAME || !process.env.SENDINBLUE_PASSWORD) {
    throw new Error('One of the sendInBlue configurations are not defined');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
  } catch (err) {
    console.error(err);
    throw new DatabaseConnectionError();
  }

  const server = app.listen(3000, () => {
    console.log('Auth service is listening on port 3000');
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED 💥💥💥. Shutting down gracefully');

    server.close(() => {
      // we don't need to manually exit the process, because SIGTERM will automatically do it
      mongoose.disconnect();
    });
  });
};

start();
