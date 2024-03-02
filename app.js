import 'dotenv/config.js';

import path from 'path';

import express from 'express';
import mongoose from 'mongoose';

import JWTAuthentication from './src/middlewares/authentication.js';

import authController from './src/controllers/auth.js';
import portfolioController from './src/controllers/portfolioItem.js';
import viewsController from './src/controllers/views.js';

const mongoURI = process.env.MONGO_URI;
const port = process.env.HTTP_PORT;

if (!mongoURI || !port || !process.env.SECRET_KEY || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log(`[x] missing enviromental required variables: 
        'MONGO_URI', 'HTTP_PORT', 'SECRET_KEY', 'SMTP_USER', 'SMTP_PASSWORD'`);

    process.exit(0);
}

main();

async function main() {
  await mongoose.connect(mongoURI).then(_ => {
    console.log(`[!] connected to mongodb successfully`);
  }).catch(e => {
    console.error(`[x] failed to initialize mongodb connection: `, e.message);
    process.exit(0);
  });

  const app = express();
  app.use(express.json());
  
  const apiRouter = express.Router();

  apiRouter.use(authController);
  apiRouter.use(`/portfolio`, JWTAuthentication, portfolioController);

  app.use(`/api/v1`, apiRouter);

  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'views'));

  app.use(viewsController);

  app.use('/uploads', express.static('uploads'));

  app.listen(port, () => {
    console.log(`[!] app listening on port ${port}`)
  });
}