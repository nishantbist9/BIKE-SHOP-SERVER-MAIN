import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

// parser
app.use(express.json());
app.use(cookieParser());

// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://bike-shop-client-ruby.vercel.app'
  ],
  credentials: true
}));


// application routes
// app.use('/api/products', BikeRoutes);
// app.use('/api', OrderRoutes);

app.use('/api/v1', router);


app.get('/', (req: Request, res: Response) => {
  res.send('Bike Shop Server is running . . . !');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
