import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import crawlRoute from './routes/crawlRoute';
import viewRouter from './routes/viewRoute';

import * as errorController from './controllers/errorController';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './src/views');


app.use('/api/v1/crawl', crawlRoute);

app.use('/', viewRouter);


app.use('*', errorController.routesNotFound);

app.use(errorController.globalErrorHandler);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});