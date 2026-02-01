import express, { Express, Request, Response } from "express";
import userRoutes from "./routes/userRoutes";
import residentRoutes from "./routes/residentRoutes";
import packageRoutes from "./routes/packageRoutes";
import communityRoutes from "./routes/communityRoutes";
import staffRoutes from "./routes/staffRoutes";
import connectDB from "./config/db";
import morgan from "morgan";
import dotenv from 'dotenv';
import cors from "cors";
import globalErrorHandler from "./controllers/errorController";
import unitRouter from "./routes/unitRoutes";
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(morgan('dev'))

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.unitlink.com",
      "https://unitlink.com",
    ],
    credentials: true, // This allows sending credentials
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);


app.get("/", (req, res) => {
  res.send("Welcome to untoldcine backend services!");
});

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/residents', residentRoutes)
app.use('/api/v1/units', unitRouter)
app.use('/api/v1/packages', packageRoutes)
app.use('/api/v1/community', communityRoutes)
app.use('/api/v1/staff', staffRoutes)

//Global Error Handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`now listening on http://localhost:${PORT}`);
});


