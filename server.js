import express from 'express';
import path from 'path';
import { APP_PORT, DB_URL } from './config';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';
import mongoose from 'mongoose';

global.appRoot = path.resolve(__dirname);
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// mongodb connection
mongoose.connect(DB_URL, {
	useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
	console.log('Database connected...');
});

app.use('/api', routes);

app.use(errorHandler);
app.listen(APP_PORT, () => {
	console.log(`Listening on port http://localhost:${APP_PORT}`);
});
