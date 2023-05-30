// @main/index.ts
import 'reflect-metadata';

import express from 'express';
import config from '@main/config';

import userRegistrationRouter from '@main/rest/endpoints/userRegistration';


const main = async () => {
  await config();

  const port = 8080;

  const app = express();

  app.use(express.json());

  app.use(userRegistrationRouter);

  app.listen(port, () => {
    console.log(`RESTful server running on port: ${port}`)
  });
};

main();