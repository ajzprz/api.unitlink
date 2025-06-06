import express, { Express, Request, Response } from "express";
import userRoutes from './routes/userRoutes';
import clerkWebhookRoutes from './routes/clerkWebhook';
import connectDB from "./config/db";

import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/clerk-webhook', clerkWebhookRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});


app.listen(PORT, () => {
  console.log(`now listening on http://localhost:${PORT}`);
});
